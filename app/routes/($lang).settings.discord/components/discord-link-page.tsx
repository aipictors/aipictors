import { useQuery } from "@apollo/client/index"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BadgeCheckIcon,
  BellRingIcon,
  CheckIcon,
  CoinsIcon,
  ExternalLinkIcon,
  Loader2Icon,
  PartyPopperIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { AchievementBadge } from "~/components/achievements/achievement-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { ACHIEVEMENT_TIERS } from "~/lib/achievements/achievement-ui"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { DiscordIcon } from "~/routes/($lang).settings.discord/components/discord-icon"
import { DiscordNamePreview } from "~/routes/($lang).settings.discord/components/discord-name-preview"
import {
  toAchievementRoleBadgeUrl,
  toDiscordTierColor,
  toLevelBadgeNumber,
  toLevelBadgeUrl,
  toLevelTier,
  toNextLevelBadgeNumber,
} from "~/routes/($lang).settings.discord/utils/discord-badges"

const DISCORD_INVITE_URL = "https://discord.gg/7jA2MmtvtR"

const VISIBLE_ACHIEVEMENTS_STEP = 24

const AUTHORIZE_URL_REFRESH_MS = 20 * 60 * 1000

type DiscordLink = {
  discordUserId: string
  username: string | null
  globalName: string | null
  avatar: string | null
  isInGuild: boolean
  level: number | null
  unlockedCount: number | null
  isAchievementVisible: boolean
  highlightKey: string | null
  celebrate: boolean
  expiryDm: boolean
  syncedAt: number | null
  syncError: boolean
}

type DiscordStatus = {
  isLinked: boolean
  bonusCoins: number
  hasReceivedBonus: boolean
  link: DiscordLink | null
}

type SettingsPatch = {
  celebrate?: boolean
  expiryDm?: boolean
  highlightKey?: string | null
}

const callStatusApi = async (body?: Record<string, unknown>) => {
  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
  const response = await fetch("/api/discord/status", {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = (await response.json()) as {
    error: string | null
    data: unknown
  }
  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Failed")
  }
  return json.data
}

/**
 * Discord 連携のページ
 */
export function DiscordLinkPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [status, setStatus] = useState<DiscordStatus | null>(null)
  const [hasLoadError, setHasLoadError] = useState(false)

  const { data } = useQuery(discordLinkViewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-and-network",
  })

  const load = async () => {
    try {
      setHasLoadError(false)
      setStatus((await callStatusApi()) as DiscordStatus)
    } catch {
      setHasLoadError(true)
    }
  }

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext.isLoading, authContext.isNotLoggedIn])

  const oauthCode = searchParams.get("code")
  const oauthState = searchParams.get("state")
  const isFinishingLink = oauthCode !== null && oauthState !== null
  const hasStartedFinishRef = useRef(false)

  // Discord から戻ってきたら連携を完了する（未ログインならログイン後に）
  useEffect(() => {
    if (!isFinishingLink || hasStartedFinishRef.current) return
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    hasStartedFinishRef.current = true

    void (async () => {
      let params: Record<string, string> = { result: "error" }
      try {
        const data = (await callStatusApi({
          intent: "finish",
          code: oauthCode,
          state: oauthState,
        })) as { result: string; bonus?: number }
        params = { result: data.result, bonus: String(data.bonus ?? 0) }
      } catch {
        // 上の既定のまま
      }
      await load()
      setSearchParams(params, { replace: true, preventScrollReset: true })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext.isLoading, authContext.isNotLoggedIn, isFinishingLink])

  // 認可画面から戻ってきたときの結果を伝える
  useEffect(() => {
    const result = searchParams.get("result")
    if (result === null) return

    const bonus = Number(searchParams.get("bonus") ?? 0)
    if (result === "linked") {
      toast.success(
        bonus > 0
          ? t(
              `連携しました！フリーコイン ${bonus} 枚をプレゼントしました`,
              `Linked! You received ${bonus} free coins`,
            )
          : t("連携しました！", "Linked!"),
      )
    } else if (result === "discord_taken") {
      toast.error(
        t(
          "この Discord アカウントは別の Aipictors アカウントと連携済みです",
          "This Discord account is already linked to another Aipictors account",
        ),
      )
    } else if (result === "user_taken") {
      toast.error(
        t(
          "別の Discord アカウントと連携済みです。解除してからやり直してください",
          "Already linked to another Discord account. Unlink it first",
        ),
      )
    } else if (result === "wrong_user") {
      toast.error(
        t(
          "連携を始めたときと別の Aipictors アカウントでログインしています。同じアカウントでやり直してください",
          "You're logged in to a different Aipictors account than the one that started linking. Please try again",
        ),
      )
    } else if (result === "expired") {
      toast.error(
        t(
          "時間が経ったため連携できませんでした。もう一度お試しください",
          "The link request expired. Please try again",
        ),
      )
    } else if (result === "error") {
      toast.error(
        t(
          "連携できませんでした。もう一度お試しください",
          "Could not link. Please try again",
        ),
      )
    }

    setSearchParams({}, { replace: true, preventScrollReset: true })
  }, [searchParams, setSearchParams, t])

  const unlocked = useMemo(
    () =>
      (data?.achievements ?? [])
        .filter((item) => item.isUnlocked)
        .sort((a, b) => b.tier - a.tier || b.points - a.points),
    [data?.achievements],
  )

  const level = data?.achievementSummary?.level ?? 1
  const viewerName = data?.viewer?.user?.name ?? authContext.displayName ?? ""
  const viewerIcon = data?.viewer?.user?.iconUrl ?? authContext.avatarPhotoURL

  if (hasLoadError) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border p-4 text-sm">
        <span className="text-destructive">
          {t("読み込めませんでした", "Could not load")}
        </span>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          {t("再読み込み", "Retry")}
        </Button>
      </div>
    )
  }

  if (isFinishingLink) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border py-16 text-center">
        <Loader2Icon className="size-8 animate-spin text-[#5865f2]" />
        <p className="font-medium">{t("連携しています…", "Linking…")}</p>
      </div>
    )
  }

  if (status === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!status.link) {
    return (
      <DiscordUnlinkedView
        name={viewerName}
        iconUrl={viewerIcon}
        level={level}
        bonusCoins={status.hasReceivedBonus ? 0 : status.bonusCoins}
      />
    )
  }

  return (
    <DiscordLinkedView
      link={status.link}
      name={viewerName}
      iconUrl={viewerIcon}
      level={level}
      achievements={unlocked}
      onChange={setStatus}
    />
  )
}

/* ------------------------------------------------------------------ */
/* 未連携                                                              */
/* ------------------------------------------------------------------ */

function DiscordUnlinkedView(props: {
  name: string
  iconUrl?: string | null
  level: number
  bonusCoins: number
}) {
  const t = useTranslation()
  const [authorizeUrl, setAuthorizeUrl] = useState<string | null>(null)
  const [hasPrepareError, setHasPrepareError] = useState(false)

  // 押した瞬間に Discord のリンクを直接開けるよう、URL を先に用意しておく。
  // 押してから通信すると、スマホが「リンクを押した」と扱わず Discord アプリが開かないことがある
  const prepare = async () => {
    try {
      setHasPrepareError(false)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const response = await fetch("/api/discord/connect", {
        method: "POST",
        headers,
      })
      const json = (await response.json()) as {
        error: string | null
        data: { url: string } | null
      }
      if (!response.ok || !json.data) {
        throw new Error(json.error ?? "Failed")
      }
      setAuthorizeUrl(json.data.url)
    } catch {
      setHasPrepareError(true)
    }
  }

  useEffect(() => {
    void prepare()
    // 有効期限（30 分）が切れる前に作り直す
    const timer = setInterval(() => void prepare(), AUTHORIZE_URL_REFRESH_MS)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const benefits = [
    {
      icon: BadgeCheckIcon,
      title: t("名前の横にバッジ", "A badge next to your name"),
      body: t(
        "レベルのバッジか、好きな実績のバッジがサーバーの名前の横に付きます",
        "Your level badge or a favorite achievement appears next to your name in the server",
      ),
    },
    {
      icon: SparklesIcon,
      title: t("レベルを自動で反映", "Level updates automatically"),
      body: t(
        "レベルが上がると、バッジと名前の色が自動で変わります",
        "When you level up, your badge and name color update on their own",
      ),
    },
    {
      icon: CoinsIcon,
      title:
        props.bonusCoins > 0
          ? t(
              `フリーコイン ${props.bonusCoins} 枚`,
              `${props.bonusCoins} free coins`,
            )
          : t("連携ボーナス", "Link bonus"),
      body:
        props.bonusCoins > 0
          ? t(
              "はじめて連携したときに 1 回だけもらえます（7 日間有効）",
              "A one-time gift for your first link (valid for 7 days)",
            )
          : t(
              "連携ボーナスは受け取り済みです",
              "You have already received the link bonus",
            ),
    },
    {
      icon: PartyPopperIcon,
      title: t("達成をお祝い（希望者）", "Celebrate unlocks (optional)"),
      body: t(
        "ゴールド以上の実績を達成すると、サーバーでお祝いの投稿ができます",
        "Share Gold or higher achievements with the server",
      ),
    },
    {
      icon: BellRingIcon,
      title: t("失効前のお知らせ（希望者）", "Expiry reminders (optional)"),
      body: t(
        "コインが失効する前に Discord の DM でお知らせします",
        "Get a Discord DM before your coins expire",
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#5865f2] to-[#3c45a5] p-5 text-white md:p-7">
        <h2 className="font-bold text-2xl leading-tight md:text-3xl">
          {t("Discord の名前に、", "Wear your achievements")}
          <br />
          {t("あなたの実績を。", "on Discord.")}
        </h2>
        <p className="mt-2 text-sm text-white/85 leading-6">
          {t(
            "連携するだけで、レベルや実績のバッジが Aipictors の Discord サーバーで自動で表示されます。",
            "Link once, and your level and achievement badges show up automatically in the Aipictors Discord server.",
          )}
        </p>

        <DiscordNamePreview
          className="mt-4"
          name={props.name || t("あなた", "You")}
          iconUrl={props.iconUrl}
          badgeUrl={toLevelBadgeUrl(props.level)}
          color={toDiscordTierColor(toLevelTier(props.level))}
        />
        <p className="mt-1.5 text-white/70 text-xs">
          {t("実際の見え方の例です", "A preview of how it looks")}
        </p>

        {hasPrepareError ? (
          <Button
            onClick={() => void prepare()}
            className="mt-4 h-12 w-full gap-2 bg-white font-bold text-[#404eed] text-base hover:bg-white/90 sm:w-auto sm:px-8"
          >
            {t("もう一度試す", "Try again")}
          </Button>
        ) : authorizeUrl === null ? (
          <Button
            disabled
            className="mt-4 h-12 w-full gap-2 bg-white font-bold text-[#404eed] text-base hover:bg-white/90 sm:w-auto sm:px-8"
          >
            <Loader2Icon className="size-5 animate-spin" />
            {t("Discord と連携する", "Link with Discord")}
          </Button>
        ) : (
          <Button
            asChild
            className="mt-4 h-12 w-full gap-2 bg-white font-bold text-[#404eed] text-base hover:bg-white/90 sm:w-auto sm:px-8"
          >
            <a href={authorizeUrl}>
              <DiscordIcon className="size-5" />
              {t("Discord と連携する", "Link with Discord")}
            </a>
          </Button>
        )}
        <p className="mt-2 text-white/80 text-xs">
          {t(
            "Discord アプリが入っていればアプリで開きます。いつでも解除でき、解除すると表示も元に戻ります",
            "Opens in the Discord app if you have it. Unlink anytime and everything goes back to how it was",
          )}
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-bold">
          {t("連携するとできること", "What you get")}
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="flex gap-3 rounded-xl border p-3.5"
            >
              <benefit.icon className="mt-0.5 size-5 shrink-0 text-[#5865f2]" />
              <div className="min-w-0">
                <p className="font-semibold text-sm">{benefit.title}</p>
                <p className="mt-0.5 text-muted-foreground text-xs leading-5">
                  {benefit.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex gap-3 rounded-xl bg-muted/50 p-3.5">
        <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 text-muted-foreground text-xs leading-5">
          <p>
            {t(
              "受け取るのは Discord の ID・名前・アイコンだけです。メッセージや参加サーバーは見ません。",
              "We only receive your Discord ID, name and icon. We can't see your messages or servers.",
            )}
          </p>
          <p>
            {t(
              "ニックネームは変更しません。バッジは Aipictors のサーバーの中で表示されます。",
              "Your nickname stays as it is. Badges appear inside the Aipictors server.",
            )}
          </p>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 連携済み                                                            */
/* ------------------------------------------------------------------ */

type UnlockedAchievement = {
  key: string
  name: string
  tier: number
  isHidden: boolean
}

function DiscordLinkedView(props: {
  link: DiscordLink
  name: string
  iconUrl?: string | null
  level: number
  achievements: UnlockedAchievement[]
  onChange: (status: DiscordStatus) => void
}) {
  const t = useTranslation()
  const [draft, setDraft] = useState<SettingsPatch>({})
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [visibleCount, setVisibleCount] = useState(VISIBLE_ACHIEVEMENTS_STEP)
  const nextBadgeLevel = toNextLevelBadgeNumber(props.level)

  const link = { ...props.link, ...draft }
  const selected =
    props.achievements.find((item) => item.key === link.highlightKey) ?? null
  const discordName =
    props.link.globalName ?? props.link.username ?? props.name

  const save = async (patch: SettingsPatch) => {
    setDraft((current) => ({ ...current, ...patch }))
    try {
      const status = (await callStatusApi({
        intent: "settings",
        ...patch,
      })) as DiscordStatus
      props.onChange(status)
      setDraft((current) => {
        const next = { ...current }
        for (const key of Object.keys(patch) as (keyof SettingsPatch)[]) {
          delete next[key]
        }
        return next
      })
      toast.success(t("Discord に反映しました", "Updated on Discord"))
    } catch {
      setDraft({})
      toast.error(t("保存できませんでした", "Could not save"))
    }
  }

  const syncNow = async () => {
    try {
      setIsSyncing(true)
      props.onChange((await callStatusApi({ intent: "sync" })) as DiscordStatus)
      toast.success(t("Discord に反映しました", "Updated on Discord"))
    } catch {
      toast.error(t("反映できませんでした", "Could not update"))
    } finally {
      setIsSyncing(false)
    }
  }

  const unlink = async () => {
    try {
      setIsUnlinking(true)
      await callStatusApi({ intent: "unlink" })
      props.onChange((await callStatusApi()) as DiscordStatus)
      toast.success(t("連携を解除しました", "Unlinked"))
    } catch {
      toast.error(t("解除できませんでした", "Could not unlink"))
    } finally {
      setIsUnlinking(false)
    }
  }

  const switches = [
    {
      id: "celebrate" as const,
      title: t("達成をサーバーでお祝いする", "Celebrate unlocks in the server"),
      body: t(
        "ゴールド以上の実績を達成すると、お祝いのチャンネルに投稿します",
        "Posts to the celebration channel when you unlock Gold or higher",
      ),
      value: link.celebrate,
    },
    {
      id: "expiryDm" as const,
      title: t("コインの失効前に DM で知らせる", "DM me before coins expire"),
      body: t(
        "48 時間以内に失効するコインがあるとき、1 日 1 回まで。その日限りの毎日のコインは対象外です",
        "At most once a day, when coins expire within 48 hours. Same-day daily coins aren't included",
      ),
      value: link.expiryDm,
    },
  ]

  return (
    <div className="space-y-4">
      <section className="flex items-center gap-3 rounded-xl border p-3.5">
        {props.link.avatar ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${props.link.discordUserId}/${props.link.avatar}.png?size=96`}
            alt=""
            className="size-11 shrink-0 rounded-full"
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#5865f2] text-white">
            <DiscordIcon className="size-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{discordName}</p>
          <p className="flex items-center gap-1 text-emerald-600 text-xs dark:text-emerald-400">
            <CheckIcon className="size-3.5" />
            {t("連携中", "Linked")}
            {props.link.username && (
              <span className="truncate text-muted-foreground">
                ・@{props.link.username}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void syncNow()}
          disabled={isSyncing}
          aria-label={t("今すぐ反映", "Update now")}
        >
          <RefreshCwIcon className={cn("size-4", isSyncing && "animate-spin")} />
        </Button>
      </section>

      {!props.link.isInGuild && (
        <section className="flex flex-col gap-3 rounded-xl border border-[#5865f2]/50 bg-[#5865f2]/10 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm">
              {t(
                "あと少し！Aipictors の Discord サーバーに参加してください",
                "Almost there! Join the Aipictors Discord server",
              )}
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs leading-5">
              {t(
                "名前の横の表示はサーバーの中で付きます。参加すると自動で反映されます。",
                "Badges appear inside the server and are applied automatically when you join.",
              )}
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2 bg-[#5865f2] text-white hover:bg-[#4752c4]">
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="size-4" />
              {t("サーバーに参加", "Join server")}
            </a>
          </Button>
        </section>
      )}

      {!props.link.isAchievementVisible && (
        <Notice>
          {t(
            "実績を他の人に見せない設定になっているため、バッジとレベルは表示していません。",
            "Badges and level are hidden because your achievements are set to private.",
          )}{" "}
          <Link to="/achievements" className="underline underline-offset-2">
            {t("設定を見る", "Open settings")}
          </Link>
        </Notice>
      )}

      {props.link.syncError && (
        <Notice>
          {t(
            "Discord への反映でエラーが起きました。少し待ってから右上のボタンで試してください。",
            "Could not update Discord. Please wait a moment and use the button above to try again.",
          )}
        </Notice>
      )}

      <section className="space-y-3 rounded-xl border p-4">
        <div>
          <h2 className="font-bold">
            {t("名前の横に出すバッジ", "Badge next to your name")}
          </h2>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {t(
              "選ぶとすぐ Discord に反映されます",
              "Your choice applies to Discord right away",
            )}
          </p>
        </div>

        <DiscordNamePreview
          name={discordName}
          iconUrl={props.iconUrl}
          badgeUrl={
            selected
              ? toAchievementRoleBadgeUrl(selected.key)
              : toLevelBadgeUrl(props.level)
          }
          color={toDiscordTierColor(
            selected ? selected.tier : toLevelTier(props.level),
          )}
        />

        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          <li>
            <BadgeOption
              isSelected={selected === null}
              label={t(`レベル ${props.level}`, `Level ${props.level}`)}
              sublabel={t("自動", "Auto")}
              onSelect={() => void save({ highlightKey: null })}
            >
              <img
                src={toLevelBadgeUrl(props.level)}
                alt=""
                className="size-12 object-contain"
              />
            </BadgeOption>
          </li>
          {props.achievements.slice(0, visibleCount).map((item) => (
            <li key={item.key}>
              <BadgeOption
                isSelected={selected?.key === item.key}
                label={item.name}
                sublabel={t(
                  ACHIEVEMENT_TIERS[item.tier]?.ja ?? "",
                  ACHIEVEMENT_TIERS[item.tier]?.en ?? "",
                )}
                onSelect={() => void save({ highlightKey: item.key })}
              >
                <AchievementBadge
                  achievementKey={item.key}
                  name={item.name}
                  tier={item.tier}
                  isHidden={item.isHidden}
                  isUnlocked={true}
                  size={48}
                />
              </BadgeOption>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground text-xs leading-5">
          {t(
            `レベルのバッジは 1・5・10・15・20、その先は 10 ごとの節目の数字です。今はレベル ${props.level} なので「${toLevelBadgeNumber(props.level)}」のバッジです。`,
            `Level badges show milestones: 1, 5, 10, 15, 20, then every 10 levels. You are level ${props.level}, so your badge shows ${toLevelBadgeNumber(props.level)}.`,
          )}
          {nextBadgeLevel !== null &&
            t(
              `次はレベル ${nextBadgeLevel} で変わります。`,
              ` It changes next at level ${nextBadgeLevel}.`,
            )}
        </p>

        {props.achievements.length > visibleCount && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              setVisibleCount((value) => value + VISIBLE_ACHIEVEMENTS_STEP)
            }
          >
            {t(
              `もっと見る（あと ${props.achievements.length - visibleCount} 個）`,
              `Show more (${props.achievements.length - visibleCount} left)`,
            )}
          </Button>
        )}
      </section>

      <section className="divide-y rounded-xl border">
        {switches.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 p-4">
            <label htmlFor={`discord-${item.id}`} className="min-w-0">
              <span className="block font-medium text-sm">{item.title}</span>
              <span className="mt-0.5 block text-muted-foreground text-xs leading-5">
                {item.body}
              </span>
            </label>
            <Switch
              id={`discord-${item.id}`}
              checked={item.value}
              onCheckedChange={(value) => void save({ [item.id]: value })}
            />
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground" disabled={isUnlinking}>
              {t("連携を解除する", "Unlink Discord")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("連携を解除しますか？", "Unlink Discord?")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  "サーバーのバッジを外します。また連携できますが、連携ボーナスは 1 回だけです。",
                  "Your badges will be removed. You can link again, but the bonus is one-time only.",
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("やめる", "Cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void unlink()}>
                {t("解除する", "Unlink")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function BadgeOption(props: {
  isSelected: boolean
  label: string
  sublabel: string
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={props.isSelected}
      onClick={props.onSelect}
      className={cn(
        "relative flex h-full w-full flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors",
        props.isSelected
          ? "border-[#5865f2] bg-[#5865f2]/10 ring-1 ring-[#5865f2]"
          : "hover:bg-muted",
      )}
    >
      {props.isSelected && (
        <CheckIcon className="absolute top-1.5 right-1.5 size-4 text-[#5865f2]" />
      )}
      {props.children}
      <span className="line-clamp-2 break-all text-xs leading-4">
        {props.label}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {props.sublabel}
      </span>
    </button>
  )
}

function Notice(props: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-5">
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="min-w-0">{props.children}</p>
    </div>
  )
}

const discordLinkViewerQuery = graphql(
  `query DiscordLinkViewer {
    viewer {
      id
      user {
        id
        name
        iconUrl
      }
    }
    achievementSummary {
      level
    }
    achievements {
      key
      name
      tier
      points
      isHidden
      isUnlocked
    }
  }`,
)
