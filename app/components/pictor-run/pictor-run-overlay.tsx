import {
  ArmchairIcon,
  ChevronDownIcon,
  ChevronsUpIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  MessageCircleIcon,
  PauseIcon,
  PlayIcon,
  ShirtIcon,
  SmileIcon,
  TagIcon,
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
  type PictorRunArtwork,
  type PictorRunMessage,
  submitPictorRunScore,
} from "~/components/pictor-run/pictor-run-api"
import { PictorRunArtworks } from "~/components/pictor-run/pictor-run-artworks"
import type { PictorRunSound } from "~/components/pictor-run/pictor-run-audio.client"
import { PictorRunChatPanel } from "~/components/pictor-run/pictor-run-chat"
import type {
  PictorRunCallbacks,
  PictorRunGame,
  PictorRunItems,
  PictorRunLobbyAction,
  PictorRunMarker,
} from "~/components/pictor-run/pictor-run-game.client"
import {
  connectPictorRunLobby,
  PICTOR_RUN_LOBBY_EMOTE,
  PICTOR_RUN_LOBBY_EMOTES,
  PICTOR_RUN_LOBBY_STAMPS,
  PICTOR_RUN_LOBBY_STATUS_MAX_LENGTH,
  PICTOR_RUN_LOBBY_STATUSES,
  PICTOR_RUN_LOBBY_START,
  type PictorRunLobbyConnection,
} from "~/components/pictor-run/pictor-run-lobby"
import { PictorRunRankingPanel } from "~/components/pictor-run/pictor-run-ranking"
import { toPictorRunSharePageUrl } from "~/components/pictor-run/pictor-run-share"
import {
  PICTOR_RUN_STAGE_LENGTH,
  PICTOR_RUN_STAGES,
  toPictorRunStageName,
} from "~/components/pictor-run/pictor-run-stages"
import {
  encodePictorRunOutfit,
  loadPictorRunWardrobe,
  PICTOR_RUN_WARDROBE_ITEMS,
  PICTOR_RUN_WARDROBE_SLOTS,
  type PictorRunWardrobe,
  type PictorRunWardrobeItem,
  type PictorRunWardrobeSlot,
  savePictorRunWardrobe,
} from "~/components/pictor-run/pictor-run-wardrobe"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  onClose: () => void
  /** 開いたら、走る前の画面ではなくロビーに入る */
  startInLobby?: boolean
}>

/** いま走っているほかの人（走っている間の「いまプレイ中」に出す） */
type Runner = { c: number; name: string; icon: string | null; d: number }

/** 画面のはしに少しの間だけ出す、スタンプの知らせ */
type StampToast = {
  id: number
  name: string
  icon: string | null
  text: string
  /** どこから（「123m」「ロビー」） */
  where: string
}

type Phase =
  | "loading"
  | "ready"
  | "running"
  | "paused"
  | "over"
  | "failed"
  | "lobby"

type Panel = "chat" | "ranking"

const MODEL_URL = "/images/pictor-chan/pictor-chan-3d-v4.glb"
const BEST_KEY = "pictor-run-best"
const BEST_STAGE_KEY = "pictor-run-best-stage"
const LITE_KEY = "pictor-run-lite"
const SOUND_KEY = "pictor-run-sound"
/** ロビーの下のボタン（動き・スタンプ）を閉じているか */
const TRAY_KEY = "pictor-run-lobby-tray"
/** ロビーで名前の上に出すステータス（「#番号」か、自分で書いた文） */
const STATUS_KEY = "pictor-run-status"

function loadStatus(): string | null {
  try {
    return window.localStorage.getItem(STATUS_KEY) || null
  } catch {
    return null
  }
}
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

/** スタンプの知らせなどに出す、小さな丸いアイコン（ない人は灰色の丸） */
function PeerIcon(props: { icon: string | null }): React.ReactNode {
  return props.icon ? (
    <img
      src={props.icon}
      alt=""
      width={20}
      height={20}
      className="size-5 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="size-5 shrink-0 rounded-full bg-slate-300" />
  )
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

/** 新着の作品の中から、ランダムに count 件を選ぶ */
const pickArtworks = (works: PictorRunArtwork[], count: number) => {
  const pool = [...works]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
    .slice(0, count)
    .map((work) => ({ id: work.id, url: work.imageUrl, author: work.userName }))
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
  // 開発中だけ: ログインできない確認用のブラウザで、ログイン中の見た目を確かめるための仮の利用者
  const debugViewer =
    import.meta.env.DEV && typeof window !== "undefined"
      ? window.localStorage.getItem("pictor-run-debug-viewer")
      : null
  const viewerId = auth.isLoggedIn ? auth.userId : debugViewer
  const viewerName = auth.isLoggedIn ? auth.displayName : debugViewer
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
  /** 額ぶちに飾れる作品（新着。ここから遊ぶたびに選ぶ） */
  const artworksRef = useRef<PictorRunArtwork[]>([])
  /** この回に額ぶちに出てきた作品（新しい順） */
  const seenRef = useRef<string[]>([])
  const [seenWorks, setSeenWorks] = useState<PictorRunArtwork[]>([])
  const [hearts, setHearts] = useState(3)
  const [items, setItems] = useState<PictorRunItems>(NO_ITEMS)
  /** ロビーで、近くにある看板 */
  const [lobbyNear, setLobbyNear] = useState<PictorRunLobbyAction | null>(null)
  /** ほかの人の数（ロビーにいる人・いま走っている人） */
  const [crowd, setCrowd] = useState({ lobby: 0, playing: 0 })
  /** きせかえ（ためたコイン・買ったもの・身につけているもの） */
  const [wardrobe, setWardrobe] = useState<PictorRunWardrobe>(
    loadPictorRunWardrobe,
  )
  const wardrobeRef = useRef(wardrobe)
  wardrobeRef.current = wardrobe
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [shopSlot, setShopSlot] = useState<PictorRunWardrobeSlot>("head")
  /** ロビーの下のボタン（動き・スタンプ）を出しているか */
  /** ロビーで、画面のボタンや表示を隠しているか（歩く・跳ぶはできる） */
  const [isLobbyUiHidden, setIsLobbyUiHidden] = useState(false)
  const [isTrayOpen, setIsTrayOpen] = useState(() => {
    try {
      return window.localStorage.getItem(TRAY_KEY) !== "closed"
    } catch {
      return true
    }
  })
  const [runners, setRunners] = useState<Runner[]>([])
  const [toasts, setToasts] = useState<StampToast[]>([])
  const toastId = useRef(0)
  /** 走っている間の、スタンプを選ぶ小さな窓 */
  const [isStampTrayOpen, setIsStampTrayOpen] = useState(false)
  /** いまの得点（画面の左上に m で出している数字） */
  const distanceRef = useRef(0)
  /** スタンプの知らせを出す（4 秒で消える。多いときは新しい 3 つだけ） */
  const pushToast = (toast: Omit<StampToast, "id">) => {
    toastId.current += 1
    const id = toastId.current
    setToasts((current) => [...current.slice(-2), { ...toast, id }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 4200)
  }
  const pushToastRef = useRef(pushToast)
  pushToastRef.current = pushToast
  /** ロビーでしている動き（おどる・すわる など） */
  const [emote, setEmote] = useState(0)
  /** ロビーで名前の上に出すステータス */
  const [status, setStatus] = useState<string | null>(loadStatus)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [statusDraft, setStatusDraft] = useState("")
  /** ステータスの文字（用意された文は、見ている人の言語で） */
  const toStatusText = (value: string | null) => {
    if (value === null) return null
    const preset = /^#(\d+)$/.exec(value)
    if (!preset) return value
    const item = PICTOR_RUN_LOBBY_STATUSES[Number(preset[1])]
    return item ? `${item.icon} ${t(item.ja, item.en)}` : null
  }
  const toStatusTextRef = useRef(toStatusText)
  toStatusTextRef.current = toStatusText
  const statusRef = useRef(status)
  statusRef.current = status
  const lobbyRef = useRef<PictorRunLobbyConnection | null>(null)
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
          onHearts: setHearts,
          onArtwork: (id) => {
            if (phaseRef.current !== "running") return
            seenRef.current = [
              id,
              ...seenRef.current.filter((item) => item !== id),
            ].slice(0, 10)
          },
          onStart: () => {
            seenRef.current = []
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
            // 画面の左上に出している数字（m）と同じものを知らせる
            distanceRef.current = nextScore
            if (phaseRef.current === "running") {
              lobbyRef.current?.progress(distanceRef.current)
            }
            setProgress(
              (distance % PICTOR_RUN_STAGE_LENGTH) / PICTOR_RUN_STAGE_LENGTH,
            )
          },
          onItems: setItems,
          onLobbyNear: setLobbyNear,
          onLobbyMove: (x, z, y, f) => lobbyRef.current?.move(x, z, y, f),
          onLobbyEmote: (next) => {
            setEmote(next)
            lobbyRef.current?.emote(next)
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
            setSeenWorks(
              seenRef.current.flatMap((id) => {
                const work = artworksRef.current.find((item) => item.id === id)
                return work ? [work] : []
              }),
            )
            setPhase("over")
            setIsSettingsOpen(false)
            // 集めたコインは、きせかえ用にためる
            if (finalCoins > 0) {
              const saved = {
                ...wardrobeRef.current,
                coins: wardrobeRef.current.coins + finalCoins,
              }
              wardrobeRef.current = saved
              savePictorRunWardrobe(saved)
              setWardrobe(saved)
            }
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
          .then((works) => {
            if (cancelled) return
            artworksRef.current = works
            game.setArtworks(pickArtworks(works, lite ? 6 : 12))
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
  useEffect(() => {
    if (!isGameReady) return
    let cancelled = false
    fetchPictorRunRanking("week")
      .then((ranking) => {
        if (cancelled) return
        gameRef.current?.setMarkers(
          toMarkers(ranking.items, viewerIdRef.current),
        )
        gameRef.current?.setRankingBoard(
          t("🏆 今週のランキング", "🏆 This week's ranking"),
          t("まだ記録がありません", "No records yet"),
          ranking.items.slice(0, 5).map((item) => ({
            rank: item.rank,
            name: item.user.name,
            score: item.score,
          })),
        )
      })
      .catch(() => {
        // 看板が立たなくても遊べる
        if (cancelled) return
        gameRef.current?.setRankingBoard(
          t("🏆 今週のランキング", "🏆 This week's ranking"),
          t("いまは読み込めません", "Could not load right now"),
          [],
        )
      })
    return () => {
      cancelled = true
    }
  }, [isGameReady, rankingKey])

  // ロビーのリアルタイム通信。遊んでいる間もつないでおき、ロビーにいる人から「いま走っている人」として見えるようにする
  // （だれも動いていない間は、サーバー側は眠っていて料金がかからない）
  useEffect(() => {
    if (!isGameReady) return
    gameRef.current?.setLobbyStatus(toStatusTextRef.current(statusRef.current))
    gameRef.current?.setOutfit(wardrobeRef.current.outfit)
    const connection = connectPictorRunLobby({
      mode: "run",
      status: statusRef.current,
      outfit: encodePictorRunOutfit(wardrobeRef.current.outfit),
      onPeers: (peers) => {
        gameRef.current?.setPeers(
          peers.map((peer) => ({
            key: peer.c,
            name: peer.name,
            iconUrl: toSignIconUrl(peer.icon),
            playing: peer.mode === "run",
            x: peer.x,
            z: peer.z ?? 0,
            y: peer.y,
            f: peer.f,
            emote: peer.a,
            outfit: peer.w,
            // 走っている人は、薄い姿に「走行中」の札を付けて出す
            status:
              peer.mode === "run"
                ? t("🏃 走行中", "🏃 Running")
                : toStatusTextRef.current(peer.st),
          })),
        )
        const lobby = peers.filter((peer) => peer.mode === "lobby").length
        const playing = peers.length - lobby
        setCrowd((current) =>
          current.lobby === lobby && current.playing === playing
            ? current
            : { lobby, playing },
        )
        // いま走っている人（遠くまで行っている順）
        const next = peers
          .filter((peer) => peer.mode === "run")
          .sort((a, b) => b.d - a.d)
          .slice(0, 8)
          .map((peer) => ({
            c: peer.c,
            name: peer.name,
            icon: toSignIconUrl(peer.icon),
            d: peer.d,
          }))
        setRunners((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next,
        )
      },
      onStamp: (peer, index) => {
        const text = toStampText(index)
        if (!text) return
        const inLobby = phaseRef.current === "lobby"
        // ロビーにいる人どうしは、頭の上のふきだしで。それ以外は、画面のはしに名前とアイコン付きで出す
        if (inLobby && peer.mode === "lobby") {
          gameRef.current?.showStamp(peer.c, text)
          return
        }
        pushToastRef.current({
          name: peer.name,
          icon: toSignIconUrl(peer.icon),
          text,
          where: peer.mode === "run" ? `${peer.d}m` : t("ロビー", "Lobby"),
        })
      },
    })
    lobbyRef.current = connection
    return () => {
      connection.close()
      lobbyRef.current = null
    }
  }, [isGameReady])

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

  const enterLobby = () => {
    // 同時に入った人と重ならないように、立つ場所を少しずつずらす
    const x = PICTOR_RUN_LOBBY_START.x + (Math.random() - 0.5) * 6
    const z = PICTOR_RUN_LOBBY_START.z + (Math.random() - 0.5) * 1.6
    gameRef.current?.enterLobby(x, z)
    lobbyRef.current?.setMode("lobby", x, z)
    setScore(0)
    setCoins(0)
    setStage(0)
    setProgress(0)
    setStageBanner(null)
    setRank(null)
    setIsSettingsOpen(false)
    setPhase("lobby")
    gameRef.current?.playSound("ui")
  }

  // ぴくたーちゃんのページの「ロビー」から開いたときは、読み込みが済んだらそのままロビーに入る
  const enteredLobby = useRef(false)
  const enterLobbyRef = useRef(enterLobby)
  enterLobbyRef.current = enterLobby
  useEffect(() => {
    if (!props.startInLobby || !isGameReady || enteredLobby.current) return
    enteredLobby.current = true
    enterLobbyRef.current()
  }, [props.startInLobby, isGameReady])

  const retry = () => {
    if (phaseRef.current === "lobby") lobbyRef.current?.setMode("run")
    setIsStatusOpen(false)
    setIsShopOpen(false)
    gameRef.current?.restart()
    // 遊ぶたびに、飾る作品を選び直す
    gameRef.current?.setArtworks(
      pickArtworks(artworksRef.current, lite ? 6 : 12),
    )
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
      if (event.code === "Enter" && phase === "lobby" && lobbyNear) {
        runLobbySign(lobbyNear)
      }
      // ロビーでは、数字キーであいさつのスタンプを出す
      const digit = /^(?:Digit|Numpad)([1-9])$/.exec(event.code)
      if (digit && (phase === "lobby" || phase === "running")) {
        sendStamp(Number(digit[1]) - 1)
      }
      if (event.code === "KeyP") {
        if (phase === "running") pause()
        else resume()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  /** スタンプの文字（見ている人の言語で） */
  const toStampText = (index: number) => {
    const stamp = PICTOR_RUN_LOBBY_STAMPS[index]
    return stamp ? `${stamp.icon} ${t(stamp.ja, stamp.en)}` : null
  }
  /**
   * あいさつのスタンプを出す。ロビーでは、自分の頭の上と、ほかの人の画面に出る。
   * 走っている間は、いまの距離を付けて、ロビーの人と走っている人の画面のはしに出る
   */
  const sendStamp = (index: number) => {
    const text = toStampText(index)
    if (!text) return
    if (phase === "lobby") {
      if (lobbyRef.current?.stamp(index) === false) return
      gameRef.current?.showStamp(null, text)
      gameRef.current?.playSound("ui")
      return
    }
    setIsStampTrayOpen(false)
    if (lobbyRef.current?.stamp(index, distanceRef.current) === false) return
    pushToast({
      name: viewerName ?? t("あなた", "You"),
      icon: null,
      text,
      where: `${distanceRef.current}m`,
    })
  }
  /** ステータスを変える（null で消す）。次に開いたときも同じものを出す */
  const changeStatus = (next: string | null) => {
    setStatus(next)
    setIsStatusOpen(false)
    try {
      if (next === null) window.localStorage.removeItem(STATUS_KEY)
      else window.localStorage.setItem(STATUS_KEY, next)
    } catch {
      // 保存できなくても、この回は出せる
    }
    lobbyRef.current?.setStatus(next)
    gameRef.current?.setLobbyStatus(toStatusText(next))
  }
  /** きせかえを変える（保存して、自分の姿と、ほかの人の画面に出す） */
  const changeWardrobe = (next: PictorRunWardrobe) => {
    wardrobeRef.current = next
    setWardrobe(next)
    savePictorRunWardrobe(next)
    gameRef.current?.setOutfit(next.outfit)
    lobbyRef.current?.setOutfit(encodePictorRunOutfit(next.outfit))
  }
  /** 買う（コインが足りるときだけ）。買ったら、そのまま身につける */
  const buyItem = (item: PictorRunWardrobeItem) => {
    if (wardrobe.owned.includes(item.id) || wardrobe.coins < item.price) return
    changeWardrobe({
      coins: wardrobe.coins - item.price,
      owned: [...wardrobe.owned, item.id],
      outfit: { ...wardrobe.outfit, [item.slot]: item.id },
    })
    gameRef.current?.playSound("best")
  }
  /** 身につける・はずす */
  const toggleItem = (item: PictorRunWardrobeItem) => {
    if (!wardrobe.owned.includes(item.id)) return
    changeWardrobe({
      ...wardrobe,
      outfit: {
        ...wardrobe.outfit,
        [item.slot]: wardrobe.outfit[item.slot] === item.id ? null : item.id,
      },
    })
    gameRef.current?.playSound("ui")
  }
  const toggleTray = () => {
    const next = !isTrayOpen
    setIsTrayOpen(next)
    try {
      window.localStorage.setItem(TRAY_KEY, next ? "open" : "closed")
    } catch {
      // 覚えられなくても困らない
    }
  }
  /** ロビーの下のボタン（動き・スタンプ）を閉じる・出す */
  const trayToggle = (
    <button
      type="button"
      aria-expanded={isTrayOpen}
      onClick={(event) => {
        event.currentTarget.blur()
        toggleTray()
      }}
      className="pointer-events-auto flex h-8 cursor-pointer items-center gap-1 rounded-full bg-slate-900/60 px-3 font-bold text-white text-xs shadow-sm hover:bg-slate-900/80"
    >
      {isTrayOpen ? (
        <ChevronDownIcon aria-hidden="true" className="size-4" />
      ) : (
        <SmileIcon aria-hidden="true" className="size-4" />
      )}
      {isTrayOpen
        ? t("しまう", "Hide")
        : t("スタンプ・うごき", "Stamps & motions")}
    </button>
  )
  /** おどる・すわる などの動き（もう一度押すとやめる） */
  const lobbyEmotes = (
    <ul
      aria-label={t("動き", "Motions")}
      className="pointer-events-auto grid w-full max-w-sm grid-cols-4 gap-1 md:flex md:w-auto md:max-w-none md:justify-center md:gap-2"
    >
      {PICTOR_RUN_LOBBY_EMOTES.map((item) => {
        const isOn = emote === item.emote
        const isSit = item.emote === PICTOR_RUN_LOBBY_EMOTE.sit
        return (
          <li key={item.emote} className="min-w-0">
            <button
              type="button"
              aria-pressed={isOn}
              onClick={(event) => {
                event.currentTarget.blur()
                gameRef.current?.setLobbyEmote(isOn ? 0 : item.emote)
                gameRef.current?.playSound("ui")
              }}
              className={cn(
                "flex h-9 w-full cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap rounded-full px-1 font-bold text-[11px] tracking-tighter shadow-sm transition-transform active:scale-90 md:h-10 md:gap-1 md:px-4 md:text-sm md:tracking-normal",
                isOn
                  ? "bg-amber-400 text-slate-900"
                  : "bg-slate-900/70 text-white hover:bg-slate-900/85",
              )}
            >
              <span aria-hidden="true" className="text-xs md:text-base">
                {item.icon}
              </span>
              <span>
                {isOn && isSit ? t("立つ", "Stand") : t(item.ja, item.en)}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
  /** 押すだけで出せる、あいさつのスタンプ */
  const lobbyStamps = (
    <ul
      aria-label={t("あいさつのスタンプ", "Greeting stamps")}
      className="pointer-events-auto grid w-full max-w-sm grid-cols-4 gap-1 md:flex md:w-auto md:max-w-none md:flex-wrap md:justify-center md:gap-2"
    >
      {PICTOR_RUN_LOBBY_STAMPS.map((stamp, index) => (
        <li key={stamp.ja} className="min-w-0">
          <button
            type="button"
            onClick={(event) => {
              event.currentTarget.blur()
              sendStamp(index)
            }}
            title={isDesktop ? `${index + 1}` : undefined}
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-0.5 whitespace-nowrap rounded-full bg-white/90 px-1 font-bold text-[11px] text-slate-800 tracking-tighter shadow-sm transition-transform hover:bg-white active:scale-90 md:h-10 md:gap-1 md:px-4 md:text-sm md:tracking-normal"
          >
            <span aria-hidden="true" className="text-xs md:text-base">
              {stamp.icon}
            </span>
            <span>{t(stamp.ja, stamp.en)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
  /** ロビーの看板を使う */
  const runLobbySign = (action: PictorRunLobbyAction) => {
    if (action === "start") retry()
    else if (action === "shop") setIsShopOpen(true)
    else changePanel(action)
  }
  const lobbyButton = (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.blur()
        enterLobby()
      }}
      className="pointer-events-auto flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white/85 px-4 font-bold text-slate-700 text-xs shadow-sm transition-colors hover:bg-white"
    >
      <ArmchairIcon aria-hidden="true" className="size-4" />
      {t("ロビーへ", "Go to lobby")}
    </button>
  )
  /** ロビーで、ぴくたーちゃんを好きな向きに動かすスティック */
  const moveStick = (event: React.PointerEvent<HTMLDivElement>) => {
    const pad = event.currentTarget
    const rect = pad.getBoundingClientRect()
    const reach = rect.width / 2 - 18
    let dx = event.clientX - (rect.left + rect.width / 2)
    let dy = event.clientY - (rect.top + rect.height / 2)
    const far = Math.hypot(dx, dy)
    if (far > reach) {
      dx *= reach / far
      dy *= reach / far
    }
    const knob = pad.firstElementChild as HTMLElement | null
    if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`
    gameRef.current?.setLobbyInput(dx / reach, dy / reach)
  }
  const releaseStick = (event: React.PointerEvent<HTMLDivElement>) => {
    const knob = event.currentTarget.firstElementChild as HTMLElement | null
    if (knob) knob.style.transform = ""
    gameRef.current?.setLobbyInput(0, 0)
  }

  const stageName = toPictorRunStageName(stage)
  // シェアすると、得点（ログイン中ならアイコンと名前も）の入ったカードの画像が出る
  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    t(
      `ぴくたーちゃんランで ${score} 点！（${Math.max(0, score - coins * 10)}m・ステージ ${stage + 1}「${stageName.ja}」） #Aipictors #ぴくたーちゃんラン`,
      `I scored ${score} in Pictor-chan Run! (${Math.max(0, score - coins * 10)}m, stage ${stage + 1}: ${stageName.en}) #Aipictors`,
    ),
  )}&url=${encodeURIComponent(
    toPictorRunSharePageUrl({ score, coins, stage, userId: viewerId }),
  )}`

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
  const hideLobbyUi = phase === "lobby" && isLobbyUiHidden
  const coinsBadge = (
    <span className="rounded-full bg-white/85 px-4 py-1.5 text-amber-500 shadow-sm backdrop-blur-sm">
      ●{" "}
      <span
        key={coins}
        className="zoom-in-150 inline-block animate-in duration-200"
      >
        {coins}
      </span>
    </span>
  )
  const heartsBadge = (
    <span
      role="img"
      aria-label={t(`ハート ${hearts}`, `${hearts} hearts`)}
      className="flex h-10 items-center gap-0.5 rounded-full bg-white/85 px-3 shadow-sm backdrop-blur-sm md:h-11"
    >
      {[0, 1, 2].map((index) => (
        <HeartIcon
          key={index}
          aria-hidden="true"
          className={cn(
            "size-5 transition-all duration-300",
            index < hearts
              ? "fill-rose-500 text-rose-500"
              : "scale-75 fill-slate-200 text-slate-300",
          )}
        />
      ))}
    </span>
  )
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
          {/* ロビーでは、得点とコインは出さない（走っていないので 0 のまま） */}
          {phase !== "lobby" && (
            <div className="flex items-center gap-2 font-black text-lg tabular-nums md:text-2xl">
              <span className="rounded-full bg-white/85 px-4 py-1.5 shadow-sm backdrop-blur-sm">
                {score}
                <span className="ml-1 font-bold text-xs md:text-sm">m</span>
              </span>
              {isDesktop && coinsBadge}
              {isPlaying && isDesktop && heartsBadge}
            </div>
          )}
          {/* スマホでは、右上のボタンと重ならないように、ハートとコインを 2 段目に置く */}
          {!isDesktop && phase !== "lobby" && (
            <div className="flex items-center gap-2 font-black text-lg tabular-nums">
              {isPlaying && heartsBadge}
              {coinsBadge}
            </div>
          )}
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

        <div
          className={cn(
            "absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 flex items-center gap-2",
            hideLobbyUi && "hidden",
          )}
        >
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
                "ジャンプでよけよう。空中でもう 1 回押すと 2 段ジャンプ！ ハートは 3 つ、🛡️🧲⭐❤️ のアイテムも出るよ",
                "Jump to dodge. Press again in mid-air for a double jump! You have 3 hearts. Grab 🛡️🧲⭐❤️ items",
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
                {lobbyButton}
              </div>
            </div>
          </div>
        )}

        {isPlaying && (
          <>
            {/* 左下: 届いたスタンプと、いま走っているほかの人。押せないので、跳ぶ操作のじゃまにならない */}
            <div className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 flex max-w-[calc(100%-5rem)] flex-col items-start gap-1.5">
              {toasts.map((toast) => (
                <p
                  key={toast.id}
                  className="fade-in slide-in-from-left-4 flex max-w-full animate-in items-center gap-1.5 rounded-full bg-slate-900/70 py-1 pr-3 pl-1 text-white text-xs duration-200"
                >
                  <PeerIcon icon={toast.icon} />
                  <span className="truncate font-bold">{toast.name}</span>
                  <span className="shrink-0 text-white/70 tabular-nums">
                    {toast.where}
                  </span>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-black text-slate-900">
                    {toast.text}
                  </span>
                </p>
              ))}
              {runners.length > 0 && (
                <div className="flex max-w-full items-center gap-1.5 rounded-full bg-white/80 py-1 pr-3 pl-2.5 text-slate-800 text-xs shadow-sm backdrop-blur-sm">
                  <span className="shrink-0 font-black">
                    🏃{" "}
                    {t(
                      `いまプレイ中 ${runners.length}人`,
                      `${runners.length} playing now`,
                    )}
                  </span>
                  {runners.slice(0, isDesktop ? 4 : 2).map((runner) => (
                    <span
                      key={runner.c}
                      className="flex min-w-0 items-center gap-1"
                    >
                      <PeerIcon icon={runner.icon} />
                      <span className="max-w-20 truncate font-bold">
                        {runner.name}
                      </span>
                      <span className="shrink-0 text-slate-500 tabular-nums">
                        {runner.d}m
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* 右下: スタンプ。押すと小さな窓が開き、選ぶと閉じる */}
            <div className="absolute right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col items-end gap-2">
              {isStampTrayOpen && (
                <ul
                  aria-label={t("あいさつのスタンプ", "Greeting stamps")}
                  className="fade-in zoom-in-95 grid animate-in grid-cols-2 gap-1 rounded-3xl bg-white/90 p-1.5 shadow-lg backdrop-blur duration-150"
                >
                  {PICTOR_RUN_LOBBY_STAMPS.map((stamp, index) => (
                    <li key={stamp.ja}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.currentTarget.blur()
                          sendStamp(index)
                        }}
                        className="flex h-9 w-full cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-bold text-slate-800 text-xs transition-transform hover:bg-slate-100 active:scale-90"
                      >
                        <span aria-hidden="true" className="text-base">
                          {stamp.icon}
                        </span>
                        {t(stamp.ja, stamp.en)}
                        {isDesktop && (
                          <span className="ml-auto pl-1 text-[10px] text-slate-400">
                            {index + 1}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                aria-label={t("スタンプを送る", "Send a stamp")}
                aria-expanded={isStampTrayOpen}
                onClick={(event) => {
                  event.currentTarget.blur()
                  setIsStampTrayOpen(!isStampTrayOpen)
                }}
                className={cn(
                  "flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 font-black text-xs shadow-sm backdrop-blur-sm transition-colors",
                  isStampTrayOpen
                    ? "bg-white text-slate-900"
                    : "bg-white/75 text-slate-800 hover:bg-white/90",
                )}
              >
                <span aria-hidden="true" className="text-base">
                  👋
                </span>
                {t("あいさつ", "Greet")}
              </button>
            </div>
          </>
        )}

        {phase === "lobby" && (
          <>
            {/* 画面の表示を隠す・戻す（景色やぴくたーちゃんだけを見たいとき用。歩く・跳ぶはできる） */}
            <button
              type="button"
              aria-pressed={isLobbyUiHidden}
              aria-label={
                isLobbyUiHidden
                  ? t("表示を戻す", "Show the UI")
                  : t("表示を隠す", "Hide the UI")
              }
              title={
                isLobbyUiHidden
                  ? t("表示を戻す", "Show the UI")
                  : t("表示を隠す", "Hide the UI")
              }
              onClick={(event) => {
                event.currentTarget.blur()
                setIsLobbyUiHidden(!isLobbyUiHidden)
                setIsStatusOpen(false)
                setIsShopOpen(false)
              }}
              className={cn(
                HUD_BUTTON,
                "absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3",
                isLobbyUiHidden && "opacity-50 hover:opacity-100",
              )}
            >
              {isLobbyUiHidden ? (
                <EyeIcon aria-hidden="true" className="size-5" />
              ) : (
                <EyeOffIcon aria-hidden="true" className="size-5" />
              )}
            </button>
            {/* 走っている人からのスタンプ */}
            {toasts.length > 0 && !isLobbyUiHidden && (
              <div className="pointer-events-none absolute top-[max(8.5rem,calc(env(safe-area-inset-top)+7.75rem))] left-3 flex max-w-[70%] flex-col items-start gap-1.5">
                {toasts.map((toast) => (
                  <p
                    key={toast.id}
                    className="fade-in slide-in-from-left-4 flex max-w-full animate-in items-center gap-1.5 rounded-full bg-slate-900/70 py-1 pr-3 pl-1 text-white text-xs duration-200"
                  >
                    <PeerIcon icon={toast.icon} />
                    <span className="truncate font-bold">{toast.name}</span>
                    <span className="shrink-0 text-white/70 tabular-nums">
                      🏃 {toast.where}
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-black text-slate-900">
                      {toast.text}
                    </span>
                  </p>
                ))}
              </div>
            )}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-[max(4.75rem,calc(env(safe-area-inset-top)+4rem))] flex flex-col items-center gap-2 px-4 text-center",
                isLobbyUiHidden && "hidden",
              )}
            >
              <p className="rounded-full bg-slate-900/60 px-4 py-1.5 font-black text-sm text-white md:text-base">
                ☕ {t("ロビー", "Lobby")}
                <span className="ml-2 font-bold text-xs md:text-sm">
                  {t(
                    `ここに ${crowd.lobby + 1} 人 ・ プレイ中 ${crowd.playing} 人`,
                    `${crowd.lobby + 1} here · ${crowd.playing} playing`,
                  )}
                </span>
              </p>
              <div className="flex max-w-full items-center gap-1.5">
                <button
                  type="button"
                  aria-expanded={isStatusOpen}
                  onClick={(event) => {
                    event.currentTarget.blur()
                    setStatusDraft(
                      status !== null && !status.startsWith("#") ? status : "",
                    )
                    setIsStatusOpen(!isStatusOpen)
                  }}
                  className="pointer-events-auto flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3.5 font-bold text-slate-800 text-xs shadow-sm hover:bg-white"
                >
                  <TagIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {toStatusText(status) ??
                      t("ステータスを付ける", "Set a status")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.blur()
                    setIsShopOpen(true)
                  }}
                  className="pointer-events-auto flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white/90 px-3.5 font-bold text-slate-800 text-xs shadow-sm hover:bg-white"
                >
                  <ShirtIcon aria-hidden="true" className="size-3.5" />
                  {t("きせかえ", "Wardrobe")}
                  <span className="text-amber-600 tabular-nums">
                    ● {wardrobe.coins}
                  </span>
                </button>
              </div>
              {isStatusOpen && (
                <div className="fade-in slide-in-from-top-2 pointer-events-auto w-80 max-w-full animate-in space-y-3 rounded-3xl bg-white/95 p-4 text-left shadow-xl backdrop-blur duration-200">
                  <p className="font-black text-sm">
                    {t(
                      "名前の上に出すステータス",
                      "Status shown above your name",
                    )}
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {PICTOR_RUN_LOBBY_STATUSES.map((item, index) => (
                      <li key={item.ja}>
                        <button
                          type="button"
                          aria-pressed={status === `#${index}`}
                          onClick={() => changeStatus(`#${index}`)}
                          className={cn(
                            "flex h-9 w-full cursor-pointer items-center gap-1.5 rounded-full px-3 font-bold text-xs transition-colors",
                            status === `#${index}`
                              ? "bg-clear-bright-blue text-white"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-200",
                          )}
                        >
                          <span aria-hidden="true">{item.icon}</span>
                          <span className="truncate">
                            {t(item.ja, item.en)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {viewerId !== null ? (
                    <form
                      className="flex gap-1.5"
                      onSubmit={(event) => {
                        event.preventDefault()
                        const text = statusDraft.trim()
                        changeStatus(
                          text === "" || text.startsWith("#") ? null : text,
                        )
                      }}
                    >
                      <input
                        value={statusDraft}
                        onChange={(event) => setStatusDraft(event.target.value)}
                        maxLength={PICTOR_RUN_LOBBY_STATUS_MAX_LENGTH}
                        placeholder={t(
                          "自分で書く（16 文字まで）",
                          "Write your own (16 chars)",
                        )}
                        aria-label={t(
                          "ステータスを自分で書く",
                          "Write your own status",
                        )}
                        className="h-9 min-w-0 flex-1 select-text rounded-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-clear-bright-blue"
                      />
                      <button
                        type="submit"
                        className="h-9 shrink-0 cursor-pointer rounded-full bg-slate-900 px-4 font-bold text-white text-xs hover:opacity-85"
                      >
                        {t("決定", "Set")}
                      </button>
                    </form>
                  ) : (
                    <p className="text-slate-500 text-xs">
                      {t(
                        "ログインすると、自分で書いたステータスも出せます",
                        "Log in to write your own status",
                      )}
                    </p>
                  )}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => changeStatus(null)}
                      disabled={status === null}
                      className="h-8 cursor-pointer rounded-full px-3 font-bold text-rose-600 text-xs hover:bg-rose-50 disabled:cursor-default disabled:opacity-40"
                    >
                      {t("ステータスを消す", "Clear status")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(false)}
                      className="h-8 cursor-pointer rounded-full px-3 font-bold text-slate-600 text-xs hover:bg-slate-100"
                    >
                      {t("とじる", "Close")}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-3 px-4">
              {lobbyNear && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.blur()
                    runLobbySign(lobbyNear)
                  }}
                  className="zoom-in-95 pointer-events-auto h-12 animate-in cursor-pointer rounded-full bg-clear-bright-blue px-7 font-black text-base text-white shadow-lg ring-4 ring-white/70 duration-150 hover:opacity-90"
                >
                  {lobbyNear === "start"
                    ? t("🏃 ここから走る", "🏃 Start running")
                    : lobbyNear === "ranking"
                      ? t("🏆 ランキングを見る", "🏆 View ranking")
                      : lobbyNear === "shop"
                        ? t("👗 きせかえをひらく", "👗 Open the wardrobe")
                        : t("💬 チャットをひらく", "💬 Open chat")}
                </button>
              )}
              {/* スマホでは、スタンプをスティックの上に並べる */}
              {!isDesktop && !isLobbyUiHidden && trayToggle}
              {!isDesktop && !isLobbyUiHidden && isTrayOpen && lobbyEmotes}
              {!isDesktop && !isLobbyUiHidden && isTrayOpen && lobbyStamps}
              <div className="flex w-full items-end justify-between gap-3 px-1">
                <div
                  role="application"
                  aria-label={t("動かすスティック", "Move stick")}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    moveStick(event)
                  }}
                  onPointerMove={(event) => {
                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    ) {
                      moveStick(event)
                    }
                  }}
                  onPointerUp={releaseStick}
                  onPointerCancel={releaseStick}
                  onContextMenu={(event) => event.preventDefault()}
                  className="pointer-events-auto flex size-28 cursor-grab touch-none items-center justify-center rounded-full bg-white/35 shadow-md ring-2 ring-white/70 backdrop-blur-sm"
                >
                  <span className="pointer-events-none size-12 rounded-full bg-white shadow-md transition-transform duration-75" />
                </div>
                {isDesktop && !isLobbyUiHidden && (
                  <div className="flex min-w-0 flex-col items-center gap-2 pb-1">
                    {trayToggle}
                    {isTrayOpen && lobbyEmotes}
                    {isTrayOpen && lobbyStamps}
                    <p className="rounded-full bg-white/75 px-4 py-1 text-center font-bold text-xs">
                      {t(
                        "WASD・矢印キーで歩く、スペースでジャンプ、看板の前で Enter、1〜8 であいさつ",
                        "WASD or arrows to walk, Space to jump, Enter at a sign, 1-8 to greet",
                      )}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  aria-label={t("ジャンプ", "Jump")}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    gameRef.current?.jump()
                  }}
                  className="pointer-events-auto flex size-16 cursor-pointer touch-none items-center justify-center rounded-full bg-amber-400/95 shadow-md active:scale-95"
                >
                  <ChevronsUpIcon aria-hidden="true" className="size-8" />
                </button>
              </div>
            </div>
          </>
        )}

        {isShopOpen && phase === "lobby" && (
          <div className="absolute inset-0 z-20 flex items-end justify-center md:items-center md:justify-end md:p-6">
            <button
              type="button"
              aria-label={t("きせかえをとじる", "Close the wardrobe")}
              onClick={() => setIsShopOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            <div className="fade-in slide-in-from-bottom-4 relative flex max-h-[62%] w-full animate-in flex-col gap-3 rounded-t-3xl bg-white/95 p-4 shadow-2xl backdrop-blur duration-200 md:max-h-[86%] md:w-96 md:rounded-3xl">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-black text-base">
                  <ShirtIcon aria-hidden="true" className="size-5" />
                  {t("きせかえ", "Wardrobe")}
                </p>
                <p className="rounded-full bg-amber-100 px-3 py-1 font-black text-amber-700 text-sm tabular-nums">
                  ● {wardrobe.coins}
                </p>
                <button
                  type="button"
                  onClick={() => setIsShopOpen(false)}
                  aria-label={t("とじる", "Close")}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100"
                >
                  <XIcon aria-hidden="true" className="size-5" />
                </button>
              </div>
              <p className="text-slate-500 text-xs">
                {t(
                  "走って集めたコインがたまります。コインと買ったものは、この端末に保存されます。",
                  "Coins you collect while running add up. Coins and items are saved on this device.",
                )}
              </p>
              <div className="flex gap-1">
                {PICTOR_RUN_WARDROBE_SLOTS.map((item) => (
                  <button
                    key={item.slot}
                    type="button"
                    aria-pressed={shopSlot === item.slot}
                    onClick={() => setShopSlot(item.slot)}
                    className={cn(
                      "h-9 flex-1 cursor-pointer rounded-full font-bold text-xs transition-colors",
                      shopSlot === item.slot
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    )}
                  >
                    {t(item.ja, item.en)}
                  </button>
                ))}
              </div>
              <ul className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto">
                {PICTOR_RUN_WARDROBE_ITEMS.filter(
                  (item) => item.slot === shopSlot,
                ).map((item) => {
                  const isOwned = wardrobe.owned.includes(item.id)
                  const isWorn = wardrobe.outfit[item.slot] === item.id
                  const canBuy = wardrobe.coins >= item.price
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center",
                        isWorn
                          ? "border-clear-bright-blue bg-sky-50"
                          : "border-slate-200 bg-white",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-12 items-center justify-center rounded-full text-2xl"
                        style={
                          item.color === undefined
                            ? undefined
                            : {
                                backgroundColor: `#${item.color.toString(16).padStart(6, "0")}`,
                              }
                        }
                      >
                        {item.color === undefined ? item.icon : ""}
                      </span>
                      <span className="font-bold text-xs">
                        {t(item.ja, item.en)}
                      </span>
                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className={cn(
                            "h-8 w-full cursor-pointer rounded-full font-black text-xs",
                            isWorn
                              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              : "bg-clear-bright-blue text-white hover:opacity-90",
                          )}
                        >
                          {isWorn
                            ? t("はずす", "Take off")
                            : t("つける", "Wear")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => buyItem(item)}
                          disabled={!canBuy}
                          className="h-8 w-full cursor-pointer rounded-full bg-amber-400 font-black text-slate-900 text-xs tabular-nums hover:bg-amber-300 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          ● {item.price}{" "}
                          {canBuy
                            ? t("で買う", "Buy")
                            : t("たりない", "Not enough")}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
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
              {lobbyButton}
              <PictorRunArtworks works={seenWorks} />
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
