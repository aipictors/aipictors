import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { graphql, type ResultOf } from "gql.tada"
import { Share2Icon, XIcon } from "lucide-react"
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { achievementSettingsQuery } from "~/components/achievements/achievement-settings-card"
import {
  AchievementShareDialog,
  type AchievementShareTarget,
} from "~/components/achievements/achievement-share-dialog"
import { CoinIcon } from "~/components/coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  getAchievementTier,
  onAchievementCheckRequested,
} from "~/lib/achievements/achievement-ui"
import { useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/** ページを移ったときに確かめる間隔 */
const ROUTE_CHECK_INTERVAL_MS = 10 * 60 * 1000

/** 読み込み直しても間隔を守るために、確かめた時刻をタブごとに残す */
const LAST_CHECKED_AT_KEY = "achievement-last-checked-at"

const readLastCheckedAt = () => {
  if (typeof window === "undefined") return 0
  try {
    return Number(window.sessionStorage.getItem(LAST_CHECKED_AT_KEY)) || 0
  } catch {
    return 0
  }
}

const saveLastCheckedAt = (value: number) => {
  try {
    window.sessionStorage.setItem(LAST_CHECKED_AT_KEY, String(value))
  } catch {
    // 保存できなくても確かめる回数が増えるだけ
  }
}

/** 投稿・いいねなどのあと、少し待ってからまとめて確かめる */
const REQUEST_DEBOUNCE_MS = 1500

/** これ以上まとめて達成したら、1 件ずつではなく一覧で見せる */
const BULK_THRESHOLD = 4

type UnlockedAchievement = ResultOf<
  typeof checkAchievementsMutation
>["checkAchievements"]["unlocked"][number]

/**
 * 実績を確かめて、達成したら演出を出す（ログインしている人だけ。画面の操作は邪魔しない）
 * - 開いたとき・ページを移ったとき（10 分に 1 回まで）・タブに戻ったとき・投稿やいいねのあと
 * - 1 件ずつ右下（スマホは下）にカードで出す。触っている間は消えない。押すと実績ページへ
 * - はじめての確認でこれまでの分をまとめて達成したときだけ、一覧のダイアログで見せる
 */
export function AchievementWatcher() {
  const authContext = useContext(AuthContext)
  const location = useLocation()

  const [checkAchievements] = useMutation(checkAchievementsMutation)
  const [markSeen] = useMutation(markAchievementsSeenMutation)

  const [queue, setQueue] = useState<UnlockedAchievement[]>([])
  const [bulk, setBulk] = useState<{
    items: UnlockedAchievement[]
    coins: number
  } | null>(null)

  const [shareTarget, setShareTarget] = useState<AchievementShareTarget | null>(
    null,
  )

  const openShare = useCallback(
    (highlight: { key: string; name: string } | null) => {
      if (!authContext.userId) return
      setShareTarget({ userId: authContext.userId, highlight })
    },
    [authContext.userId],
  )

  /** この画面で一度出したもの（同じものを二度出さない） */
  const shownKeysRef = useRef(new Set<string>())
  const lastCheckedAtRef = useRef(readLastCheckedAt())
  const isCheckingRef = useRef(false)

  const isLoggedIn = !authContext.isLoading && authContext.isLoggedIn

  // 「達成したときのお知らせを出さない」にしている人には出さない（見たことにだけする）
  const { data: settingsData, loading: isSettingsLoading } = useQuery(
    achievementSettingsQuery,
    { skip: !isLoggedIn },
  )
  // 設定を読み終わるまでは確かめない（お知らせを出さない人に一瞬出さないため）
  const isReady = isLoggedIn && !isSettingsLoading
  const isNoticeOffRef = useRef(false)
  isNoticeOffRef.current =
    settingsData?.achievementSettings?.isUnlockNoticeOff === true

  const check = useCallback(
    async (force: boolean) => {
      if (!isLoggedIn || isCheckingRef.current) return
      isCheckingRef.current = true
      lastCheckedAtRef.current = Date.now()
      saveLastCheckedAt(lastCheckedAtRef.current)
      try {
        const { data } = await checkAchievements({ variables: { force } })
        const result = data?.checkAchievements
        if (!result) return
        const fresh = result.unlocked.filter(
          (item) => !shownKeysRef.current.has(item.key),
        )
        if (fresh.length === 0) return
        for (const item of fresh) shownKeysRef.current.add(item.key)

        // Discord の表示（レベル・お祝い）を次の反映で更新してもらう。連携していなければ何も起きない
        void requestDiscordSync()

        if (isNoticeOffRef.current) {
          void markSeen({
            variables: { keys: fresh.map((item) => item.key) },
          }).catch(() => undefined)
          return
        }

        if (result.isInitialSync && fresh.length >= BULK_THRESHOLD) {
          setBulk({
            items: fresh,
            coins: fresh.reduce((sum, item) => sum + item.rewardCoins, 0),
          })
          return
        }
        // 古い順に出す
        setQueue((current) => [...current, ...[...fresh].reverse()])
      } catch {
        // 実績はおまけなので、失敗しても何もしない
      } finally {
        isCheckingRef.current = false
      }
    },
    [checkAchievements, isLoggedIn, markSeen],
  )

  const previousPathRef = useRef<string | null>(null)

  // 開いたとき・ページを移ったとき（投稿・生成の画面から移ったときはすぐ）
  useEffect(() => {
    if (!isReady) return
    const previous = previousPathRef.current
    previousPathRef.current = location.pathname
    const isAfterCreating =
      previous !== null && /\/(new|generation)(\/|$)/.test(previous)
    if (isAfterCreating) {
      void check(true)
      return
    }
    if (Date.now() - lastCheckedAtRef.current < ROUTE_CHECK_INTERVAL_MS) return
    void check(false)
  }, [isReady, location.pathname, check])

  // タブに戻ったとき
  useEffect(() => {
    if (!isLoggedIn) return
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastCheckedAtRef.current > ROUTE_CHECK_INTERVAL_MS
      ) {
        void check(false)
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [isLoggedIn, check])

  // 投稿・いいね・フォローなどのあと
  useEffect(() => {
    if (!isLoggedIn) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = onAchievementCheckRequested(() => {
      if (timer !== null) clearTimeout(timer)
      timer = setTimeout(() => void check(true), REQUEST_DEBOUNCE_MS)
    })
    return () => {
      unsubscribe()
      if (timer !== null) clearTimeout(timer)
    }
  }, [isLoggedIn, check])

  const onShown = useCallback(
    (keys: string[]) => {
      void markSeen({ variables: { keys } }).catch(() => undefined)
    },
    [markSeen],
  )

  const current = queue[0]

  return (
    <>
      {current && (
        <AchievementUnlockToast
          key={current.key}
          achievement={current}
          remaining={queue.length - 1}
          onShown={onShown}
          onShare={openShare}
          onDone={() => setQueue((items) => items.slice(1))}
        />
      )}
      {bulk && (
        <AchievementBulkDialog
          items={bulk.items}
          coins={bulk.coins}
          onShown={onShown}
          onShare={() => {
            setBulk(null)
            openShare(null)
          }}
          onClose={() => setBulk(null)}
        />
      )}
      <AchievementShareDialog
        target={shareTarget}
        onClose={() => setShareTarget(null)}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* 1 件ずつのカード                                                     */
/* ------------------------------------------------------------------ */

const CONFETTI_COLORS = [
  "#ff4d8d",
  "#ffd166",
  "#7bf1a8",
  "#6ecbff",
  "#c39bff",
  "#ffffff",
]

function Confetti(props: { count: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: props.count }, (_, index) => {
        const angle = (Math.PI * 2 * index) / props.count + Math.random() * 0.4
        const distance = 46 + Math.random() * 46
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 10,
          r: Math.random() * 540 - 270,
          d: 0.9 + Math.random() * 0.6,
          color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
          isCircle: index % 3 === 0,
          delay: 0.25 + Math.random() * 0.15,
        }
      }),
    [props.count],
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {pieces.map((piece, index) => (
        <span
          key={index.toString()}
          className={cn(
            "achievement-confetti absolute top-1/2 left-1/2 block",
            piece.isCircle
              ? "size-1.5 rounded-full"
              : "h-2.5 w-1 rounded-[1px]",
          )}
          style={
            {
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              "--confetti-x": `${piece.x}px`,
              "--confetti-y": `${piece.y}px`,
              "--confetti-r": `${piece.r}deg`,
              "--confetti-d": `${piece.d}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function AchievementUnlockToast(props: {
  achievement: UnlockedAchievement
  remaining: number
  onShown: (keys: string[]) => void
  onShare: (highlight: { key: string; name: string } | null) => void
  onDone: () => void
}) {
  const t = useTranslation()
  const navigate = useNavigate()
  const tier = getAchievementTier(props.achievement.tier)
  const duration = props.achievement.tier >= 5 ? 8000 : 6000

  const [isLeaving, setIsLeaving] = useState(false)
  const remainingMsRef = useRef(duration)
  const startedAtRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 親が描き直されても、時間を測り直さない
  const onShownRef = useRef(props.onShown)
  onShownRef.current = props.onShown
  const onDoneRef = useRef(props.onDone)
  onDoneRef.current = props.onDone

  const leave = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    setIsLeaving(true)
    setTimeout(() => onDoneRef.current(), 300)
  }, [])

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now()
    timerRef.current = setTimeout(leave, Math.max(0, remainingMsRef.current))
  }, [leave])

  const achievementKey = props.achievement.key

  useEffect(() => {
    onShownRef.current([achievementKey])
    startTimer()
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [achievementKey, startTimer])

  // 触っている間は消えない
  const pause = () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    remainingMsRef.current -= Date.now() - startedAtRef.current
  }

  const name = t(props.achievement.name, props.achievement.enName)

  return (
    <output
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex justify-center px-3 md:inset-x-auto md:right-6 md:bottom-6"
      aria-live="polite"
    >
      <div
        className={cn(
          "achievement-toast pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card/95 shadow-2xl backdrop-blur",
          isLeaving
            ? "animate-achievement-toast-out"
            : "animate-achievement-toast-in",
        )}
        style={
          {
            "--achievement-glow": tier.glow,
            "--achievement-duration": `${duration}ms`,
          } as React.CSSProperties
        }
        onPointerEnter={pause}
        onPointerLeave={startTimer}
      >
        <button
          type="button"
          className="achievement-shine relative flex w-full items-center gap-3 p-3 pr-9 pb-9 text-left"
          onClick={() => {
            leave()
            navigate(`/achievements?highlight=${props.achievement.key}`)
          }}
        >
          <div className="relative flex size-20 shrink-0 items-center justify-center">
            <div
              aria-hidden
              className="achievement-rays absolute inset-[-30%] rounded-full"
            />
            <div className="relative animate-achievement-pop">
              <AchievementBadge
                achievementKey={props.achievement.key}
                name={name}
                tier={props.achievement.tier}
                isHidden={props.achievement.isHidden}
                isUnlocked={true}
                size={72}
              />
            </div>
            <Confetti count={props.achievement.tier >= 5 ? 26 : 16} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex items-center gap-1.5 font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
              {props.achievement.isHidden
                ? t("隠し実績を発見！", "Secret achievement!")
                : t("実績を達成！", "Achievement unlocked!")}
              <span
                className={cn(
                  "rounded-full px-1.5 py-px font-bold text-[10px] normal-case tracking-normal shadow-sm",
                  tier.chipClassName,
                )}
              >
                {t(tier.ja, tier.en)}
              </span>
              {props.remaining > 0 && (
                <span className="ml-auto rounded-full bg-muted px-1.5 py-px font-bold text-[10px] normal-case tracking-normal">
                  {t(`ほか ${props.remaining} 件`, `+${props.remaining} more`)}
                </span>
              )}
            </p>
            <p className="truncate font-bold text-base leading-tight">{name}</p>
            <p className="line-clamp-1 text-muted-foreground text-xs">
              {t(
                props.achievement.description,
                props.achievement.enDescription,
              )}
            </p>
            {props.achievement.isHidden && (
              <p className="line-clamp-1 text-[11px] text-muted-foreground">
                {t(
                  "🤫 条件はナイショにしてね",
                  "🤫 Please keep the condition a secret",
                )}
              </p>
            )}
            {props.achievement.rewardCoins > 0 && (
              <p className="flex animate-achievement-coin items-center gap-1 font-bold text-amber-600 text-sm dark:text-amber-400">
                <CoinIcon className="size-4" />+{props.achievement.rewardCoins}
                <span className="font-normal text-muted-foreground text-xs">
                  {t("フリーコイン・7日有効", "free coins · 7 days")}
                </span>
              </p>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={leave}
          className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label={t("閉じる", "Close")}
        >
          <XIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            // 隠し実績はカードにも文章にも名前を出さない（見た人のネタバレになる）
            props.onShare(
              props.achievement.isHidden
                ? null
                : { key: props.achievement.key, name },
            )
            leave()
          }}
          className="absolute right-3 bottom-2.5 flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-2.5 py-1 font-bold text-[11px] text-white shadow transition hover:brightness-110 active:scale-95"
        >
          <Share2Icon className="size-3" />
          {t("シェア", "Share")}
        </button>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-muted">
          <div
            className="achievement-timer h-full"
            style={{ backgroundColor: tier.glow }}
          />
        </div>
      </div>
    </output>
  )
}

/* ------------------------------------------------------------------ */
/* はじめての確認（まとめて達成）                                          */
/* ------------------------------------------------------------------ */

function AchievementBulkDialog(props: {
  items: UnlockedAchievement[]
  coins: number
  onShown: (keys: string[]) => void
  onShare: () => void
  onClose: () => void
}) {
  const t = useTranslation()
  const navigate = useNavigate()
  const onShownRef = useRef(props.onShown)
  onShownRef.current = props.onShown

  useEffect(() => {
    onShownRef.current(props.items.map((item) => item.key))
  }, [props.items])

  const sorted = useMemo(
    () => [...props.items].sort((a, b) => b.tier - a.tier),
    [props.items],
  )
  const best = sorted[0]

  return (
    <Dialog open={true} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader className="items-center text-center">
          {best && (
            <div className="relative mx-auto mb-2 flex size-36 items-center justify-center">
              <div
                aria-hidden
                className="achievement-rays absolute inset-[-25%] rounded-full"
                style={
                  {
                    "--achievement-glow": getAchievementTier(best.tier).glow,
                  } as React.CSSProperties
                }
              />
              <div className="relative animate-achievement-pop">
                <AchievementBadge
                  achievementKey={best.key}
                  name={best.name}
                  tier={best.tier}
                  isHidden={best.isHidden}
                  isUnlocked={true}
                  size={128}
                  isInteractive={true}
                />
              </div>
              <Confetti count={30} />
            </div>
          )}
          <DialogTitle className="text-xl">
            {t(
              `これまでの実績 ${props.items.length} 個を達成しました！`,
              `You unlocked ${props.items.length} achievements!`,
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Aipictors に実績が登場しました。これまでの創作や応援が、バッジになっています。",
              "Achievements are here. Your past creations and cheers became badges.",
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[40vh] grid-cols-5 gap-2 overflow-y-auto py-2 sm:grid-cols-6">
          {sorted.map((item, index) => (
            <div
              key={item.key}
              className="flex animate-achievement-cascade justify-center"
              style={{ animationDelay: `${Math.min(index, 30) * 40 + 300}ms` }}
              title={t(item.name, item.enName)}
            >
              <AchievementBadge
                achievementKey={item.key}
                name={t(item.name, item.enName)}
                tier={item.tier}
                isHidden={item.isHidden}
                isUnlocked={true}
                size={52}
              />
            </div>
          ))}
        </div>
        {props.coins > 0 && (
          <p className="flex animate-achievement-coin items-center justify-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
            <CoinIcon className="size-5" />
            {t(
              `お祝いに ${props.coins} フリーコイン（7日間有効）`,
              `${props.coins} free coins as a gift (valid 7 days)`,
            )}
          </p>
        )}
        <button
          type="button"
          onClick={props.onShare}
          className="achievement-shine relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 font-bold text-white shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95"
        >
          <Share2Icon className="size-4" />
          {t("実績カードをシェア", "Share my achievement card")}
        </button>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            className="flex-1 rounded-full font-bold"
            onClick={() => {
              props.onClose()
              navigate("/achievements")
            }}
          >
            {t("実績を見る", "View achievements")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 rounded-full"
            onClick={props.onClose}
          >
            {t("閉じる", "Close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const requestDiscordSync = async () => {
  try {
    const headers = await getViewerRequestHeaders({
      includeJsonContentType: true,
    })
    await fetch("/api/discord/status", {
      method: "POST",
      headers,
      body: JSON.stringify({ intent: "request-sync" }),
    })
  } catch {
    // 5 分ごとの反映に任せる
  }
}

const checkAchievementsMutation = graphql(
  `mutation CheckAchievements($force: Boolean) {
    checkAchievements(force: $force) {
      isInitialSync
      grantedCoins
      unlocked {
        key
        name
        enName
        description
        enDescription
        tier
        isHidden
        rewardCoins
        unlockedAt
      }
    }
  }`,
)

const markAchievementsSeenMutation = graphql(
  `mutation MarkAchievementsSeen($keys: [String!]!) {
    markAchievementsSeen(keys: $keys)
  }`,
)
