import {
  MessageCircleIcon,
  PauseIcon,
  PlayIcon,
  TrophyIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  fetchPictorRunArtworks,
  fetchPictorRunMessages,
  type PictorRunMessage,
  submitPictorRunScore,
} from "~/components/pictor-run/pictor-run-api"
import { PictorRunChatPanel } from "~/components/pictor-run/pictor-run-chat"
import type {
  PictorRunCallbacks,
  PictorRunGame,
} from "~/components/pictor-run/pictor-run-game.client"
import { PictorRunRankingPanel } from "~/components/pictor-run/pictor-run-ranking"
import {
  PICTOR_RUN_STAGES,
  toPictorRunStageName,
} from "~/components/pictor-run/pictor-run-stages"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  onClose: () => void
}>

type Phase = "loading" | "ready" | "running" | "paused" | "over" | "failed"

type Panel = "chat" | "ranking"

const MODEL_URL = "/images/pictor-chan/pictor-chan-3d-v3.glb"
const BEST_KEY = "pictor-run-best"
const BEST_STAGE_KEY = "pictor-run-best-stage"
const LITE_KEY = "pictor-run-lite"
const PANEL_KEY = "pictor-run-panel"
const DESKTOP_QUERY = "(min-width: 1024px)"
const MAX_MESSAGES = 200

const readBest = () => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

const readBestStage = () => {
  try {
    return Number(window.localStorage.getItem(BEST_STAGE_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * 軽量モードで始めるか。自分で選んだことがあればそれに従い、なければ端末の性能から決める
 */
const readLite = () => {
  try {
    const saved = window.localStorage.getItem(LITE_KEY)
    if (saved !== null) return saved === "1"
  } catch {
    // 読めなければ端末の性能から決める
  }
  const device = navigator as Navigator & { deviceMemory?: number }
  return (
    (device.hardwareConcurrency ?? 8) <= 4 ||
    (device.deviceMemory ?? 8) <= 4 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

const mergeMessages = (
  current: PictorRunMessage[],
  incoming: PictorRunMessage[],
  deletedIds: string[] = [],
): PictorRunMessage[] => {
  const known = new Set(current.map((message) => message.id))
  const added = incoming.filter((message) => !known.has(message.id))
  if (added.length === 0 && deletedIds.length === 0) return current
  const removed = new Set(deletedIds)
  return [...current, ...added]
    .filter((message) => !removed.has(message.id))
    .slice(-MAX_MESSAGES)
}

/**
 * ミニゲーム「ぴくたーちゃんラン」の画面（ゲーム・チャット・ランキング）。
 * 開いたときに初めて、ゲーム本体（three.js）と 3D モデルを読み込む
 */
export default function PictorRunOverlay(props: Props): React.ReactNode {
  const t = useTranslation()
  const auth = useContext(AuthContext)
  const viewerId = auth.isLoggedIn ? auth.userId : null
  const viewerName = auth.isLoggedIn ? auth.displayName : null
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<PictorRunGame | null>(null)
  const [phase, setPhase] = useState<Phase>("loading")
  const phaseRef = useRef<Phase>("loading")
  phaseRef.current = phase
  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const [rank, setRank] = useState<number | null>(null)
  const [rankingKey, setRankingKey] = useState(0)
  const [lite, setLite] = useState(readLite)
  /** 今いるステージ（0 始まりの通し番号） */
  const [stage, setStage] = useState(0)
  /** ステージが変わったときに、しばらく名前を大きく出す */
  const [stageBanner, setStageBanner] = useState<number | null>(null)
  /** これまでに着いた、いちばん先のステージ（1 始まり。0 = まだ） */
  const [bestStage, setBestStage] = useState(0)

  const [isDesktop, setIsDesktop] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const panelRef = useRef<Panel | null>(null)
  panelRef.current = panel
  const [messages, setMessages] = useState<PictorRunMessage[]>([])
  const [isChatLoaded, setIsChatLoaded] = useState(false)
  const [unread, setUnread] = useState(0)
  const lastIdRef = useRef<string | null>(null)
  const viewerIdRef = useRef(viewerId)
  viewerIdRef.current = viewerId

  // PC は最初からチャットを横に出す（前に閉じていたら閉じたまま）。スマホは押したときだけ出す
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const apply = () => {
      setIsDesktop(media.matches)
      if (!media.matches) return
      let saved: string | null = null
      try {
        saved = window.localStorage.getItem(PANEL_KEY)
      } catch {
        saved = null
      }
      setPanel(
        saved === "none" ? null : saved === "ranking" ? "ranking" : "chat",
      )
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

  const changePanel = useCallback((next: Panel | null) => {
    setPanel(next)
    if (next === "chat") setUnread(0)
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      try {
        window.localStorage.setItem(PANEL_KEY, next ?? "none")
      } catch {
        // 覚えられなくても困らない
      }
      return
    }
    // スマホでは画面をおおうので、走っている間は止める
    if (next !== null && phaseRef.current === "running") {
      gameRef.current?.setPaused(true)
      setPhase("paused")
    }
  }, [])

  const submit = useCallback(
    (finalScore: number, finalCoins: number, durationMs: number) => {
      if (viewerIdRef.current === null || finalScore <= 0) return
      submitPictorRunScore({ score: finalScore, coins: finalCoins, durationMs })
        .then((result) => {
          setRank(result.rank)
          setRankingKey((key) => key + 1)
        })
        .catch(() => {
          // ランキングに送れなくても遊べる
        })
    },
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    setBest(readBest())
    setBestStage(readBestStage())
    setPhase("loading")
    setScore(0)
    setCoins(0)
    setStage(0)
    setRank(null)

    void (async () => {
      try {
        const { createPictorRunGame } = await import(
          "~/components/pictor-run/pictor-run-game.client"
        )
        if (cancelled) return
        const callbacks: PictorRunCallbacks = {
          onStart: () => {
            setScore(0)
            setCoins(0)
            setStage(0)
            setRank(null)
            setPhase("running")
          },
          onStage: (nextStage) => {
            setStage(nextStage)
            setStageBanner(nextStage)
            setBestStage((current) => {
              if (nextStage + 1 <= current) return current
              try {
                window.localStorage.setItem(
                  BEST_STAGE_KEY,
                  String(nextStage + 1),
                )
              } catch {
                // 保存できなくても遊べる
              }
              return nextStage + 1
            })
          },
          onScore: (nextScore, nextCoins) => {
            setScore(nextScore)
            setCoins(nextCoins)
          },
          onGameOver: (finalScore, finalCoins, durationMs) => {
            const previous = readBest()
            setIsNewBest(finalScore > previous)
            if (finalScore > previous) {
              setBest(finalScore)
              try {
                window.localStorage.setItem(BEST_KEY, String(finalScore))
              } catch {
                // 保存できなくても遊べる
              }
            }
            setPhase("over")
            submit(finalScore, finalCoins, durationMs)
          },
        }
        const game = await createPictorRunGame(canvas, MODEL_URL, callbacks, {
          lite,
        })
        if (cancelled) {
          game.dispose()
          return
        }
        gameRef.current = game
        setPhase("ready")
        // 背景の額ぶちに、新しく投稿された作品を飾る（読めなくても遊べる）
        fetchPictorRunArtworks()
          .then((urls) => {
            if (!cancelled) game.setArtworks(lite ? urls.slice(0, 6) : urls)
          })
          .catch(() => {})
      } catch {
        if (!cancelled) setPhase("failed")
      }
    })()

    return () => {
      cancelled = true
      gameRef.current?.dispose()
      gameRef.current = null
    }
  }, [submit, lite])

  useEffect(() => {
    if (stageBanner === null) return
    const timer = window.setTimeout(() => setStageBanner(null), 2600)
    return () => window.clearTimeout(timer)
  }, [stageBanner])

  /** 軽量モードを切り替える（画面を作り直すので、走っている途中では切り替えない） */
  const toggleLite = () => {
    const next = !lite
    try {
      window.localStorage.setItem(LITE_KEY, next ? "1" : "0")
    } catch {
      // 覚えられなくても切り替えはできる
    }
    setLite(next)
  }

  // チャットを読む（開いている間は 6 秒ごと、閉じている間は 20 秒ごと。別のタブにいる間は読まない）
  useEffect(() => {
    let cancelled = false
    let timer = 0
    const load = async () => {
      if (!document.hidden) {
        try {
          const data = await fetchPictorRunMessages({
            afterId: lastIdRef.current ?? undefined,
          })
          if (cancelled) return
          const isFirst = lastIdRef.current === null
          const newest = data.messages.at(-1)
          if (newest) lastIdRef.current = newest.id
          setMessages((current) =>
            mergeMessages(current, data.messages, data.deletedIds),
          )
          setIsChatLoaded(true)
          if (!isFirst && panelRef.current !== "chat") {
            const fromOthers = data.messages.filter(
              (message) => message.user.id !== viewerIdRef.current,
            ).length
            if (fromOthers > 0) setUnread((count) => count + fromOthers)
          }
        } catch {
          if (!cancelled) setIsChatLoaded(true)
        }
      }
      if (cancelled) return
      timer = window.setTimeout(
        load,
        panelRef.current === "chat" ? 6000 : 20000,
      )
    }
    void load()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  const { onClose } = props

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // スタンプ選びなど、上に開いているものがあればそちらを閉じる
      if (event.key !== "Escape" || event.defaultPrevented) return
      if (document.querySelector('[role="dialog"][data-state="open"]')) return
      onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  const retry = () => {
    gameRef.current?.restart()
    setScore(0)
    setCoins(0)
    setStage(0)
    setStageBanner(null)
    setRank(null)
    setPhase("ready")
  }

  const pause = () => {
    if (phase !== "running") return
    gameRef.current?.setPaused(true)
    setPhase("paused")
  }

  const resume = () => {
    if (phase !== "paused") return
    if (!isDesktop) setPanel(null)
    gameRef.current?.setPaused(false)
    setPhase("running")
  }

  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    t(
      `ぴくたーちゃんランで ${score}m 走りました！ #Aipictors #ぴくたーちゃんラン`,
      `I ran ${score}m in Pictor-chan Run! #Aipictors`,
    ),
  )}&url=${encodeURIComponent("https://www.aipictors.com/pictor-chan")}`

  const isPanelOpen = panel !== null
  const stageName = toPictorRunStageName(stage)
  const liteButton = (
    <button
      type="button"
      onClick={(event) => {
        // スペースキーで走り始めるときに、このボタンまで押されないようにする
        event.currentTarget.blur()
        toggleLite()
      }}
      aria-pressed={lite}
      className={cn(
        "pointer-events-auto flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 font-bold text-xs shadow-sm transition-colors",
        lite
          ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
          : "bg-white/85 text-slate-700 hover:bg-white",
      )}
    >
      <ZapIcon aria-hidden="true" className="size-4" />
      {lite
        ? t("軽量モード: オン", "Lite mode: on")
        : t("軽量モード: オフ", "Lite mode: off")}
    </button>
  )
  const tabs: { value: Panel; label: string; icon: React.ReactNode }[] = [
    {
      value: "chat",
      label: t("チャット", "Chat"),
      icon: <MessageCircleIcon aria-hidden="true" className="size-4" />,
    },
    {
      value: "ranking",
      label: t("ランキング", "Ranking"),
      icon: <TrophyIcon aria-hidden="true" className="size-4" />,
    },
  ]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("ぴくたーちゃんラン", "Pictor-chan Run")}
      className="fixed inset-0 z-[80] flex select-none overflow-hidden text-slate-800"
      style={{
        background:
          "linear-gradient(180deg, #7cc8ff 0%, #b9e6ff 48%, #e9f9ff 78%, #f4fff1 100%)",
      }}
    >
      <div className="relative min-w-0 flex-1">
        <canvas
          // 軽量モードを切り替えたら、描画の設定が変わるので作り直す
          key={lite ? "lite" : "full"}
          ref={canvasRef}
          className="absolute inset-0 size-full touch-none"
          style={{ width: "100%", height: "100%" }}
        />

        <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 flex items-center gap-2 font-black text-lg tabular-nums md:text-2xl">
          <span className="rounded-full bg-white/85 px-4 py-1.5 shadow-sm">
            {score}
            <span className="ml-1 font-bold text-xs md:text-sm">m</span>
          </span>
          <span className="rounded-full bg-white/85 px-4 py-1.5 text-amber-500 shadow-sm">
            ● {coins}
          </span>
          {(phase === "running" || phase === "paused") && (
            <span className="hidden rounded-full bg-white/85 px-3 py-1.5 font-bold text-xs shadow-sm sm:inline md:text-sm">
              {t(
                `ステージ ${stage + 1} ${stageName.ja}`,
                `Stage ${stage + 1} ${stageName.en}`,
              )}
            </span>
          )}
        </div>

        {stageBanner !== null && phase === "running" && (
          <div
            key={stageBanner}
            className="fade-in slide-in-from-bottom-2 pointer-events-none absolute inset-x-0 top-[20%] flex animate-in flex-col items-center gap-1 px-6 text-center duration-500"
          >
            <p className="rounded-full bg-slate-900/55 px-4 py-1 font-black text-white text-xs tracking-widest md:text-sm">
              STAGE {stageBanner + 1}
            </p>
            <p className="rounded-full bg-slate-900/45 px-6 py-1.5 font-black text-2xl text-white md:px-8 md:py-2 md:text-4xl">
              {t(
                toPictorRunStageName(stageBanner).ja,
                toPictorRunStageName(stageBanner).en,
              )}
            </p>
          </div>
        )}

        <div className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 flex items-center gap-2">
          {(phase === "running" || phase === "paused") && (
            <button
              type="button"
              onClick={phase === "running" ? pause : resume}
              aria-label={
                phase === "running"
                  ? t("一時停止", "Pause")
                  : t("再開", "Resume")
              }
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/85 shadow-sm transition-colors hover:bg-white"
            >
              {phase === "running" ? (
                <PauseIcon aria-hidden="true" className="size-5" />
              ) : (
                <PlayIcon aria-hidden="true" className="size-5" />
              )}
            </button>
          )}
          {!isPanelOpen && (
            <>
              <button
                type="button"
                onClick={() => changePanel("ranking")}
                aria-label={t("ランキング", "Ranking")}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/85 shadow-sm transition-colors hover:bg-white"
              >
                <TrophyIcon aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => changePanel("chat")}
                aria-label={t("チャット", "Chat")}
                className="relative flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/85 shadow-sm transition-colors hover:bg-white"
              >
                <MessageCircleIcon aria-hidden="true" className="size-5" />
                {unread > 0 && (
                  <span className="-top-1 -right-1 absolute flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 font-bold text-white text-xs">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("とじる", "Close")}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/85 shadow-sm transition-colors hover:bg-white"
          >
            <XIcon aria-hidden="true" className="size-5" />
          </button>
        </div>

        {phase === "loading" && (
          <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center font-bold text-lg">
            {t("よみこみ中…", "Loading…")}
          </p>
        )}

        {phase === "failed" && (
          <p className="absolute inset-x-0 top-1/3 px-6 text-center font-bold">
            {t(
              "ごめんなさい、この端末ではゲームを表示できませんでした。",
              "Sorry, the game could not be displayed on this device.",
            )}
          </p>
        )}

        {phase === "ready" && (
          <div className="pointer-events-none absolute inset-x-0 top-[16%] flex flex-col items-center gap-2 px-6 text-center">
            <p className="font-black text-3xl text-white drop-shadow-[0_2px_0_rgba(29,47,143,0.55)] md:text-5xl">
              {t("ぴくたーちゃんラン", "Pictor-chan Run")}
            </p>
            <p className="animate-pulse rounded-full bg-white/90 px-6 py-2.5 font-black text-base shadow-sm md:text-lg">
              {isDesktop
                ? t(
                    "スペースキー / クリックでスタート",
                    "Space / click to start",
                  )
                : t("タップでスタート", "Tap to start")}
            </p>
            <p className="rounded-full bg-white/70 px-4 py-1 font-bold text-xs md:text-sm">
              {t(
                "ジャンプでよけよう。空中でもう 1 回押すと 2 段ジャンプ！",
                "Jump to dodge. Press again in mid-air for a double jump!",
              )}
            </p>
            {best > 0 && (
              <p className="font-bold text-sm text-white drop-shadow-[0_1px_0_rgba(29,47,143,0.6)]">
                {t(`じこベスト ${best} m`, `Best ${best} m`)}
              </p>
            )}
            <p className="rounded-full bg-white/70 px-4 py-1 font-bold text-xs md:text-sm">
              {t(
                `ステージは全 ${PICTOR_RUN_STAGES.length} 種類 ・ ${Math.min(bestStage, PICTOR_RUN_STAGES.length)} 種類まで到達`,
                `${PICTOR_RUN_STAGES.length} stages · reached ${Math.min(bestStage, PICTOR_RUN_STAGES.length)}`,
              )}
            </p>
            {liteButton}
          </div>
        )}

        {phase === "paused" && (
          <button
            type="button"
            onClick={resume}
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900/25"
          >
            <span className="rounded-full bg-white/95 px-8 py-3 font-black text-lg shadow-lg">
              {t("タップで再開", "Tap to resume")}
            </span>
          </button>
        )}

        {phase === "over" && (
          <div className="absolute inset-x-0 top-[12%] flex justify-center px-6">
            <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-white/95 px-6 py-5 text-center shadow-lg">
              <p className="font-black text-xl">
                {isNewBest
                  ? t("じこベスト更新！", "New best!")
                  : t("ころんじゃった…！", "Oops, I tripped!")}
              </p>
              <p className="font-black text-5xl tabular-nums">
                {score}
                <span className="ml-1 font-bold text-base">m</span>
              </p>
              <p className="font-medium text-slate-500 text-sm tabular-nums">
                {t(
                  `コイン ${coins} まい ・ ベスト ${best} m`,
                  `${coins} coins · Best ${best} m`,
                )}
              </p>
              <p className="font-bold text-slate-600 text-sm">
                {t(
                  `ステージ ${stage + 1}「${stageName.ja}」まで到達`,
                  `Reached stage ${stage + 1}: ${stageName.en}`,
                )}
              </p>
              {rank !== null && (
                <button
                  type="button"
                  onClick={() => changePanel("ranking")}
                  className="cursor-pointer rounded-full bg-amber-100 px-4 py-1 font-bold text-amber-800 text-sm"
                >
                  {t(`🏆 ランキング ${rank} 位`, `🏆 Rank #${rank}`)}
                </button>
              )}
              {viewerId === null && (
                <p className="text-slate-500 text-xs">
                  <a
                    href="/login"
                    className="font-bold text-clear-bright-blue underline"
                  >
                    {t("ログイン", "Log in")}
                  </a>
                  {t(
                    "するとランキングに記録が残ります",
                    " to save your score to the ranking",
                  )}
                </p>
              )}
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={retry}
                  className="h-11 flex-1 cursor-pointer rounded-full bg-clear-bright-blue font-bold text-sm text-white transition-opacity hover:opacity-90"
                >
                  {t("もう一度", "Play again")}
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 flex-1 items-center justify-center rounded-full border bg-white font-bold text-sm transition-colors hover:bg-slate-50"
                >
                  {t("X でシェア", "Share on X")}
                </a>
              </div>
              {liteButton}
            </div>
          </div>
        )}
      </div>

      {isPanelOpen && (
        <aside
          className={cn(
            "flex select-text flex-col bg-white shadow-2xl",
            isDesktop
              ? "relative h-full w-[360px] shrink-0 border-l"
              : "absolute inset-x-0 bottom-0 h-[72dvh] rounded-t-3xl",
          )}
        >
          <div className="flex items-center gap-1 border-b px-2 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={panel === tab.value}
                onClick={() => changePanel(tab.value)}
                className={cn(
                  "flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full font-bold text-sm transition-colors",
                  panel === tab.value
                    ? "bg-clear-bright-blue text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => changePanel(null)}
              aria-label={t("とじる", "Close")}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <XIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          {panel === "chat" ? (
            <PictorRunChatPanel
              messages={messages}
              isLoaded={isChatLoaded}
              viewer={
                viewerId !== null && viewerName !== null
                  ? { id: viewerId, name: viewerName }
                  : null
              }
              isModerator={false}
              onPosted={(message) => {
                lastIdRef.current = message.id
                setMessages((current) => mergeMessages(current, [message]))
              }}
              onDeleted={(messageId) =>
                setMessages((current) =>
                  current.filter((message) => message.id !== messageId),
                )
              }
            />
          ) : (
            <PictorRunRankingPanel
              viewerId={viewerId}
              refreshKey={rankingKey}
            />
          )}
        </aside>
      )}
    </div>,
    document.body,
  )
}
