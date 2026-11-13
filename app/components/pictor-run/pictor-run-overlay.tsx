import {
  MessageCircleIcon,
  PauseIcon,
  PlayIcon,
  TrophyIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  fetchPictorRunArtworks,
  fetchPictorRunMessages,
  fetchPictorRunRanking,
  type PictorRunMessage,
  submitPictorRunScore,
} from "~/components/pictor-run/pictor-run-api"
import type { PictorRunSound } from "~/components/pictor-run/pictor-run-audio.client"
import { PictorRunChatPanel } from "~/components/pictor-run/pictor-run-chat"
import type {
  PictorRunCallbacks,
  PictorRunGame,
  PictorRunItems,
  PictorRunMarker,
} from "~/components/pictor-run/pictor-run-game.client"
import { PictorRunRankingPanel } from "~/components/pictor-run/pictor-run-ranking"
import {
  PICTOR_RUN_STAGE_LENGTH,
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
const SOUND_KEY = "pictor-run-sound"
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

// 開いたときにいきなり鳴らさない（音を出すボタンを押してもらう）
const NO_ITEMS: PictorRunItems = { guard: false, magnet: 0, star: 0 }

const FILES_ORIGIN = "https://files.aipictors.com/"

/** 看板に貼れるアイコンの画像（別のドメインでも絵に貼れる、縮小版の配信を使う） */
const toSignIconUrl = (iconUrl: string | null) => {
  if (!iconUrl?.startsWith(FILES_ORIGIN) || iconUrl.includes("?")) return null
  const key = iconUrl.slice(FILES_ORIGIN.length)
  return key.startsWith("_w/") ? iconUrl : `${FILES_ORIGIN}_w/240/${key}`
}

/**
 * 今週のランキングから、走れた地点に立てる看板を作る。
 * 近すぎる看板は重なるので、順位の高い人を残す
 */
const toMarkers = (
  items: Awaited<ReturnType<typeof fetchPictorRunRanking>>["items"],
  viewerId: string | null,
): PictorRunMarker[] => {
  const kept: PictorRunMarker[] = []
  for (const item of items) {
    // 得点 = 走った距離 + コイン 1 枚につき 10
    const distance = item.score - item.coins * 10
    if (distance < 10) continue
    if (kept.some((other) => Math.abs(other.distance - distance) < 3)) continue
    kept.push({
      name: item.user.name,
      iconUrl: toSignIconUrl(item.user.iconUrl),
      distance,
      rank: item.rank,
      isMe: item.user.id === viewerId,
    })
  }
  return kept
}

const DEFAULT_SOUND: PictorRunSound = { bgm: 0.6, sfx: 0.8, muted: true }

const toVolume = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback

const readSound = (): PictorRunSound => {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(SOUND_KEY) ?? "null",
    ) as Partial<PictorRunSound> | null
    if (!saved) return DEFAULT_SOUND
    return {
      bgm: toVolume(saved.bgm, DEFAULT_SOUND.bgm),
      sfx: toVolume(saved.sfx, DEFAULT_SOUND.sfx),
      muted: saved.muted !== false,
    }
  } catch {
    return DEFAULT_SOUND
  }
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT")

const HUD_BUTTON =
  "flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition hover:bg-white active:scale-90"

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
  const [items, setItems] = useState<PictorRunItems>(NO_ITEMS)
  const [lite, setLite] = useState(readLite)
  /** 今いるステージ（0 始まりの通し番号） */
  const [stage, setStage] = useState(0)
  /** ステージが変わったときに、しばらく名前を大きく出す */
  const [stageBanner, setStageBanner] = useState<number | null>(null)
  /** これまでに着いた、いちばん先のステージ（1 始まり。0 = まだ） */
  const [bestStage, setBestStage] = useState(0)
  /** 今のステージをどこまで進んだか 0〜1 */
  const [progress, setProgress] = useState(0)
  const [sound, setSound] = useState(readSound)
  const soundRef = useRef(sound)
  soundRef.current = sound
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  /** 再開までの数（3 → 2 → 1）。すぐ走り出してぶつからないようにする */
  const [countdown, setCountdown] = useState<number | null>(null)

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
    setProgress(0)
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
          onScore: (nextScore, nextCoins, distance) => {
            setScore(nextScore)
            setCoins(nextCoins)
            setProgress(
              (distance % PICTOR_RUN_STAGE_LENGTH) / PICTOR_RUN_STAGE_LENGTH,
            )
          },
          onItems: setItems,
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
            setIsSettingsOpen(false)
            if (finalScore > previous) {
              // 転んだ音が終わってから、お祝いの音を鳴らす
              window.setTimeout(() => gameRef.current?.playSound("best"), 1100)
            }
            submit(finalScore, finalCoins, durationMs)
          },
        }
        const game = await createPictorRunGame(canvas, MODEL_URL, callbacks, {
          lite,
          sound: soundRef.current,
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

  // 今週の記録の看板（記録を送ったあとは、取り直して立て直す）
  const isGameReady = phase !== "loading" && phase !== "failed"
  // biome-ignore lint/correctness/useExhaustiveDependencies: rankingKey が変わったら取り直す
  useEffect(() => {
    if (!isGameReady) return
    let cancelled = false
    fetchPictorRunRanking("week")
      .then((ranking) => {
        if (cancelled) return
        gameRef.current?.setMarkers(
          toMarkers(ranking.items, viewerIdRef.current),
        )
      })
      .catch(() => {
        // 看板が立たなくても遊べる
      })
    return () => {
      cancelled = true
    }
  }, [isGameReady, rankingKey])

  useEffect(() => {
    if (stageBanner === null) return
    const timer = window.setTimeout(() => setStageBanner(null), 2600)
    return () => window.clearTimeout(timer)
  }, [stageBanner])

  const changeSound = (next: PictorRunSound) => {
    setSound(next)
    gameRef.current?.setSound(next)
    try {
      window.localStorage.setItem(SOUND_KEY, JSON.stringify(next))
    } catch {
      // 覚えられなくても音量は変えられる
    }
  }

  const toggleMute = () => {
    changeSound({ ...sound, muted: !sound.muted })
    if (sound.muted) gameRef.current?.playSound("ui")
  }

  // 別のタブやアプリへ移ったら、走っている途中でも止めておく
  useEffect(() => {
    const onLeave = () => {
      if (phaseRef.current !== "running") return
      gameRef.current?.setPaused(true)
      setPhase("paused")
    }
    const onVisibility = () => {
      if (document.hidden) onLeave()
    }
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("blur", onLeave)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("blur", onLeave)
    }
  }, [])

  // 再開の前に 3・2・1 と数える
  useEffect(() => {
    if (countdown === null) return
    if (phaseRef.current !== "paused") {
      setCountdown(null)
      return
    }
    if (countdown <= 0) {
      setCountdown(null)
      gameRef.current?.setPaused(false)
      setPhase("running")
      return
    }
    gameRef.current?.playSound("ui")
    const timer = window.setTimeout(
      () => setCountdown((value) => (value === null ? null : value - 1)),
      550,
    )
    return () => window.clearTimeout(timer)
  }, [countdown])

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
    setProgress(0)
    setStageBanner(null)
    setRank(null)
    setPhase("ready")
    gameRef.current?.playSound("ui")
  }

  const pause = () => {
    if (phase !== "running") return
    gameRef.current?.setPaused(true)
    setPhase("paused")
  }

  const resume = () => {
    if (phase !== "paused" || countdown !== null) return
    if (!isDesktop) setPanel(null)
    setIsSettingsOpen(false)
    setCountdown(3)
  }

  const toggleSettings = () => {
    // 音量を合わせている間にぶつからないよう、走っている途中なら止める
    if (!isSettingsOpen) pause()
    setIsSettingsOpen(!isSettingsOpen)
  }

  // M = ミュート、P = 一時停止 / 再開
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.repeat) return
      if (event.code === "KeyM") toggleMute()
      if (event.code === "KeyP") {
        if (phase === "running") pause()
        else resume()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    t(
      `ぴくたーちゃんランで ${score}m 走りました！ #Aipictors #ぴくたーちゃんラン`,
      `I ran ${score}m in Pictor-chan Run! #Aipictors`,
    ),
  )}&url=${encodeURIComponent("https://www.aipictors.com/pictor-chan")}`

  const isPanelOpen = panel !== null

  // スマホで文字を打つとき、キーボードに押されてタブ（チャット・ランキング）が画面の外へ出ないように、
  // 実際に見えている範囲にチャット欄を収める
  const [visible, setVisible] = useState<{
    top: number
    height: number
  } | null>(null)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport || isDesktop || !isPanelOpen) {
      setVisible(null)
      return
    }
    const update = () => {
      const isKeyboardOpen =
        viewport.height < window.innerHeight - 120 || viewport.height < 480
      setVisible(
        isKeyboardOpen
          ? { top: viewport.offsetTop, height: viewport.height }
          : null,
      )
    }
    update()
    viewport.addEventListener("resize", update)
    viewport.addEventListener("scroll", update)
    return () => {
      viewport.removeEventListener("resize", update)
      viewport.removeEventListener("scroll", update)
    }
  }, [isDesktop, isPanelOpen])
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
  // 音が出ていない間は、大きく目立たせる
  const soundButton = (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.blur()
        toggleMute()
      }}
      aria-pressed={!sound.muted}
      className={cn(
        "pointer-events-auto flex cursor-pointer items-center rounded-full font-bold shadow-sm transition-colors",
        sound.muted
          ? "h-12 gap-2 bg-clear-bright-blue px-6 text-base text-white shadow-lg ring-4 ring-white/70 hover:opacity-90"
          : "h-9 gap-1.5 bg-white/85 px-4 text-slate-700 text-xs hover:bg-white",
      )}
    >
      {sound.muted ? (
        <VolumeXIcon aria-hidden="true" className="size-5" />
      ) : (
        <Volume2Icon aria-hidden="true" className="size-4" />
      )}
      {sound.muted
        ? t("音を出す（BGM・効果音）", "Turn sound on")
        : t("音: オン", "Sound: on")}
    </button>
  )
  const isPlaying = phase === "running" || phase === "paused"
  const sliders: { key: "bgm" | "sfx"; label: string }[] = [
    { key: "bgm", label: t("BGM", "Music") },
    { key: "sfx", label: t("効果音", "Sound effects") },
  ]
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

        {/* 画面のはしを少し暗くして、奥行きを出す */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(20,24,70,0.26) 100%)",
          }}
        />
        {stageBanner !== null && (
          <div
            key={`flash-${stageBanner}`}
            className="fade-out pointer-events-none absolute inset-0 animate-out bg-white/60 fill-mode-forwards duration-700"
          />
        )}
        {phase === "over" && (
          <div className="fade-out pointer-events-none absolute inset-0 animate-out bg-rose-500/35 fill-mode-forwards duration-500" />
        )}

        <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 font-black text-lg tabular-nums md:text-2xl">
            <span className="rounded-full bg-white/85 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              {score}
              <span className="ml-1 font-bold text-xs md:text-sm">m</span>
            </span>
            <span className="rounded-full bg-white/85 px-4 py-1.5 text-amber-500 shadow-sm backdrop-blur-sm">
              ●{" "}
              <span
                key={coins}
                className="zoom-in-150 inline-block animate-in duration-200"
              >
                {coins}
              </span>
            </span>
          </div>
          {isPlaying && (
            <div className="w-44 rounded-2xl bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm md:w-60">
              <p className="flex items-baseline justify-between gap-2 font-bold text-[11px] md:text-xs">
                <span className="truncate">
                  {t(
                    `${stage + 1}. ${stageName.ja}`,
                    `${stage + 1}. ${stageName.en}`,
                  )}
                </span>
                <span className="shrink-0 text-slate-500 tabular-nums">
                  {t(
                    `あと ${Math.max(1, Math.ceil((1 - progress) * PICTOR_RUN_STAGE_LENGTH))}m`,
                    `${Math.max(1, Math.ceil((1 - progress) * PICTOR_RUN_STAGE_LENGTH))}m left`,
                  )}
                </span>
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400 transition-[width] duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          )}
          {isPlaying && (items.guard || items.magnet > 0 || items.star > 0) && (
            <div className="flex items-center gap-1.5 font-black text-xs tabular-nums md:text-sm">
              {items.guard && (
                <span className="rounded-full bg-sky-500 px-3 py-1 text-white shadow-sm">
                  🛡️ {t("ガード", "Guard")}
                </span>
              )}
              {items.magnet > 0 && (
                <span className="rounded-full bg-rose-500 px-3 py-1 text-white shadow-sm">
                  🧲 {items.magnet}
                </span>
              )}
              {items.star > 0 && (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-slate-900 shadow-sm">
                  ⭐ {items.star}
                </span>
              )}
            </div>
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
          {isPlaying && (
            <button
              type="button"
              onClick={phase === "running" ? pause : resume}
              aria-label={
                phase === "running"
                  ? t("一時停止", "Pause")
                  : t("再開", "Resume")
              }
              className={HUD_BUTTON}
            >
              {phase === "running" ? (
                <PauseIcon aria-hidden="true" className="size-5" />
              ) : (
                <PlayIcon aria-hidden="true" className="size-5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.currentTarget.blur()
              toggleSettings()
            }}
            aria-label={t("音量と設定", "Sound and settings")}
            aria-expanded={isSettingsOpen}
            className={cn(
              HUD_BUTTON,
              isSettingsOpen && "bg-white",
              sound.muted &&
                "bg-clear-bright-blue text-white hover:bg-clear-bright-blue",
            )}
          >
            {sound.muted ? (
              <VolumeXIcon aria-hidden="true" className="size-5" />
            ) : (
              <Volume2Icon aria-hidden="true" className="size-5" />
            )}
          </button>
          {!isPanelOpen && (
            <>
              {/* スマホで走っている間は、ボタンを減らして画面を広く使う（ランキングはチャットの中から開ける） */}
              {(isDesktop || !isPlaying) && (
                <button
                  type="button"
                  onClick={() => changePanel("ranking")}
                  aria-label={t("ランキング", "Ranking")}
                  className={HUD_BUTTON}
                >
                  <TrophyIcon aria-hidden="true" className="size-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => changePanel("chat")}
                aria-label={t("チャット", "Chat")}
                className={cn(HUD_BUTTON, "relative")}
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
            className={HUD_BUTTON}
          >
            <XIcon aria-hidden="true" className="size-5" />
          </button>
        </div>

        {isSettingsOpen && (
          <>
            <button
              type="button"
              aria-label={t("設定をとじる", "Close settings")}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 z-10 cursor-default"
            />
            <div className="fade-in slide-in-from-top-2 absolute top-[calc(max(0.75rem,env(safe-area-inset-top))+3.25rem)] right-3 z-20 flex w-72 max-w-[calc(100%-1.5rem)] animate-in flex-col gap-3 rounded-3xl bg-white/95 p-4 shadow-xl backdrop-blur duration-200">
              <div className="flex items-center justify-between">
                <p className="font-black text-sm">{t("サウンド", "Sound")}</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!sound.muted}
                  onClick={toggleMute}
                  className={cn(
                    "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 font-bold text-xs transition-colors",
                    sound.muted
                      ? "bg-slate-200 text-slate-600"
                      : "bg-clear-bright-blue text-white",
                  )}
                >
                  {sound.muted ? (
                    <VolumeXIcon aria-hidden="true" className="size-4" />
                  ) : (
                    <Volume2Icon aria-hidden="true" className="size-4" />
                  )}
                  {sound.muted ? t("ミュート中", "Muted") : t("オン", "On")}
                </button>
              </div>
              {sliders.map((slider) => (
                <label
                  key={slider.key}
                  className={cn(
                    "flex items-center gap-3 font-bold text-xs",
                    sound.muted && "opacity-50",
                  )}
                >
                  <span className="w-14 shrink-0">{slider.label}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={Math.round(sound[slider.key] * 100)}
                    onChange={(event) =>
                      changeSound({
                        ...sound,
                        [slider.key]: Number(event.target.value) / 100,
                      })
                    }
                    onPointerUp={() => {
                      if (slider.key === "sfx") {
                        gameRef.current?.playSound("coin")
                      }
                    }}
                    className="h-8 min-w-0 flex-1 cursor-pointer accent-sky-500"
                  />
                  <span className="w-8 shrink-0 text-right text-slate-500 tabular-nums">
                    {Math.round(sound[slider.key] * 100)}
                  </span>
                </label>
              ))}
              <div className="flex items-center justify-between border-t pt-3">
                <div>
                  <p className="font-black text-sm">
                    {t("軽量モード", "Lite mode")}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isPlaying
                      ? t(
                          "走っている間は切り替えられません",
                          "Can't be changed during a run",
                        )
                      : t(
                          "影や細かい演出を減らして軽くします",
                          "Fewer shadows and effects",
                        )}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={lite}
                  disabled={isPlaying}
                  onClick={toggleLite}
                  className={cn(
                    "flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 font-bold text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    lite
                      ? "bg-amber-400 text-slate-900"
                      : "bg-slate-200 text-slate-600",
                  )}
                >
                  <ZapIcon aria-hidden="true" className="size-4" />
                  {lite ? t("オン", "On") : t("オフ", "Off")}
                </button>
              </div>
              {isDesktop && (
                <p className="border-t pt-3 text-[11px] text-slate-500 leading-relaxed">
                  {t(
                    "スペース / ↑ / クリック: ジャンプ ・ P: 一時停止 ・ M: ミュート ・ Esc: とじる",
                    "Space / ↑ / click: jump · P: pause · M: mute · Esc: close",
                  )}
                </p>
              )}
            </div>
          </>
        )}

        {phase === "loading" && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
            <p className="flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 font-bold shadow-sm">
              <span className="size-5 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-500" />
              {t("よみこみ中…", "Loading…")}
            </p>
          </div>
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
                "ジャンプでよけよう。空中でもう 1 回押すと 2 段ジャンプ！ 🛡️🧲⭐ のアイテムも出るよ",
                "Jump to dodge. Press again in mid-air for a double jump! Grab 🛡️🧲⭐ items",
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
            <div className="flex flex-col items-center gap-3">
              {sound.muted && soundButton}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {!sound.muted && soundButton}
                {liteButton}
              </div>
            </div>
          </div>
        )}

        {phase === "paused" && !isSettingsOpen && countdown === null && (
          <button
            type="button"
            onClick={resume}
            className="fade-in absolute inset-0 flex animate-in cursor-pointer flex-col items-center justify-center gap-3 bg-slate-900/35 backdrop-blur-[2px] duration-200"
          >
            <span className="font-black text-2xl text-white tracking-widest drop-shadow">
              {t("一時停止中", "PAUSED")}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white/95 px-8 py-3 font-black text-lg shadow-lg">
              <PlayIcon aria-hidden="true" className="size-5" />
              {isDesktop
                ? t("クリック / P で再開", "Click / P to resume")
                : t("タップで再開", "Tap to resume")}
            </span>
          </button>
        )}

        {countdown !== null && countdown > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <span
              key={countdown}
              className="zoom-in-150 fade-in animate-in font-black text-8xl text-white drop-shadow-[0_4px_0_rgba(29,47,143,0.6)] duration-300 md:text-9xl"
            >
              {countdown}
            </span>
          </div>
        )}

        {phase === "over" && (
          <div className="absolute inset-x-0 top-[12%] flex justify-center px-6">
            <div className="fade-in zoom-in-95 slide-in-from-bottom-4 flex w-full max-w-xs animate-in flex-col items-center gap-3 rounded-3xl bg-white/95 fill-mode-backwards px-6 py-5 text-center shadow-lg backdrop-blur delay-300 duration-300">
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
              {/* 13 ステージのうち、今回どこまで来たか */}
              <div aria-hidden="true" className="flex items-center gap-1">
                {PICTOR_RUN_STAGES.map((item, index) => (
                  <span
                    key={item.en}
                    className={cn(
                      "rounded-full",
                      index === stage % PICTOR_RUN_STAGES.length
                        ? "size-2.5 bg-amber-400 ring-2 ring-amber-200"
                        : index < stage || stage >= PICTOR_RUN_STAGES.length
                          ? "size-2 bg-sky-400"
                          : "size-2 bg-slate-200",
                    )}
                  />
                ))}
              </div>
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
            </div>
          </div>
        )}
      </div>

      {isPanelOpen && (
        <aside
          className={cn(
            "flex select-text flex-col bg-white shadow-2xl",
            isDesktop
              ? "relative h-full w-[380px] shrink-0 border-l"
              : "absolute inset-x-0 bottom-0 h-[82dvh] overflow-hidden rounded-t-3xl",
            visible && "rounded-none",
          )}
          style={
            visible
              ? { top: visible.top, bottom: "auto", height: visible.height }
              : undefined
          }
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
