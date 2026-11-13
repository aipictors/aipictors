import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * ミニゲーム「ぴくたーちゃんラン」のロビー（休憩場）のリアルタイム通信。
 * いま遊んでいる人・ロビーにいる人と、ロビーで動かしているぴくたーちゃんの位置をやりとりする。
 * サーバーは lobby.aipictors.com（Durable Object。だれも動いていない間は料金がかからない作り）
 */

const LOBBY_URL = "wss://lobby.aipictors.com/ws"
const LOBBY_COUNT_URL = "https://lobby.aipictors.com/count"

/**
 * いまロビーにいる人数と、走っている人数（つながずに、数だけ聞く）
 */
export async function fetchPictorRunLobbyCount(): Promise<{
  lobby: number
  playing: number
} | null> {
  try {
    const response = await fetch(LOBBY_COUNT_URL)
    if (!response.ok) return null
    const json = (await response.json()) as { lobby?: number; playing?: number }
    return {
      lobby: Number(json.lobby) || 0,
      playing: Number(json.playing) || 0,
    }
  } catch {
    return null
  }
}

export type PictorRunLobbyMode = "run" | "lobby"

/** ロビーに入ったときに立つ場所 */
export const PICTOR_RUN_LOBBY_START = { x: 0.8, z: 5.4 }

/**
 * ロビーで押すだけで出せる、あいさつのスタンプ（頭の上にふきだしで出る）。
 * 通信では番号だけを送り、見る人の言語で表示する。並びを変えると番号がずれるので、足すときは末尾に
 */
export const PICTOR_RUN_LOBBY_STAMPS: readonly {
  icon: string
  ja: string
  en: string
}[] = [
  { icon: "👋", ja: "こんにちは", en: "Hello" },
  { icon: "😊", ja: "よろしく", en: "Hi there" },
  { icon: "👍", ja: "いいね", en: "Nice" },
  { icon: "👏", ja: "おつかれ", en: "Good job" },
  { icon: "🙏", ja: "ありがとう", en: "Thanks" },
  { icon: "😂", ja: "あはは", en: "Haha" },
  { icon: "🏃", ja: "走ろう！", en: "Let's run" },
  { icon: "🌙", ja: "またね", en: "See you" },
]

/**
 * ロビーでできる動き（番号を通信で送る。0 = なにもしていない）。
 * 歩く・跳ぶと、やめる
 */
export const PICTOR_RUN_LOBBY_EMOTE = {
  none: 0,
  dance: 1,
  spin: 2,
  wave: 3,
  sit: 4,
} as const

export const PICTOR_RUN_LOBBY_EMOTES: readonly {
  emote: number
  icon: string
  ja: string
  en: string
}[] = [
  {
    emote: PICTOR_RUN_LOBBY_EMOTE.wave,
    icon: "🙋",
    ja: "手をふる",
    en: "Wave",
  },
  {
    emote: PICTOR_RUN_LOBBY_EMOTE.dance,
    icon: "💃",
    ja: "おどる",
    en: "Dance",
  },
  {
    emote: PICTOR_RUN_LOBBY_EMOTE.spin,
    icon: "🌀",
    ja: "くるくる",
    en: "Spin",
  },
  { emote: PICTOR_RUN_LOBBY_EMOTE.sit, icon: "🪑", ja: "すわる", en: "Sit" },
]

/**
 * 名前の上に出すステータスの、用意された文。通信では「#番号」で送り、見る人の言語で表示する。
 * 足すときは末尾に（並びを変えると番号がずれる）。自分で書いた文は、そのまま送る（ログイン中の人だけ）
 */
export const PICTOR_RUN_LOBBY_STATUSES: readonly {
  icon: string
  ja: string
  en: string
}[] = [
  { icon: "💻", ja: "作業中", en: "Working" },
  { icon: "🎨", ja: "お絵かき中", en: "Drawing" },
  { icon: "☕", ja: "休憩中", en: "On a break" },
  { icon: "🍚", ja: "ごはん中", en: "Eating" },
  { icon: "💬", ja: "話しかけてOK", en: "Up for a chat" },
  { icon: "👀", ja: "見てるだけ", en: "Just watching" },
  { icon: "🚪", ja: "離席中", en: "Away" },
  { icon: "💤", ja: "ねおち", en: "Asleep" },
]

/** 自分で書くステータスの長さ */
export const PICTOR_RUN_LOBBY_STATUS_MAX_LENGTH = 16

/** スタンプを続けて出せる間隔 */
const STAMP_INTERVAL_MS = 700

export type PictorRunLobbyPeer = {
  /** 接続の番号 */
  c: number
  /** ログイン中の人の番号（ゲストは null） */
  id: string | null
  name: string
  icon: string | null
  mode: PictorRunLobbyMode
  x: number
  z: number
  y: number
  /** 向いている角度 */
  f: number
  /** している動き（PICTOR_RUN_LOBBY_EMOTE。0 = なし） */
  a: number
  /** ステータス（「#番号」= 用意された文、それ以外 = 自分で書いた文） */
  st: string | null
  /** 走っている人の、いまの距離（m） */
  d: number
}

export type PictorRunLobbyConnection = {
  /** ロビーに入った・走りに戻った */
  setMode: (mode: PictorRunLobbyMode, x?: number, z?: number) => void
  /** ロビーでの自分の位置（動いたときだけ呼ぶ） */
  move: (x: number, z: number, y: number, f: number) => void
  /** あいさつのスタンプを出す（送れたら true。続けて押したときは false）。走っている間は、いまの距離も付ける */
  stamp: (index: number, distance?: number) => boolean
  /** 走っている距離（m）を知らせる（数秒に 1 回だけ送る） */
  progress: (distance: number) => void
  /** ロビーでの動き（おどる・すわる など）を知らせる */
  emote: (emote: number) => void
  /** ステータスを変える（「#番号」か、自分で書いた文。null で消す） */
  setStatus: (status: string | null) => void
  close: () => void
}

/**
 * ロビーにつなぐ。つながらなくても遊べるので、失敗は黙って何度かやり直すだけにする
 */
export function connectPictorRunLobby(props: {
  mode: PictorRunLobbyMode
  /** つないだときのステータス */
  status: string | null
  onPeers: (peers: PictorRunLobbyPeer[]) => void
  /** ほかの人がスタンプを出した（走っている人のものは、そのときの距離が付く） */
  onStamp: (peer: PictorRunLobbyPeer, index: number) => void
}): PictorRunLobbyConnection {
  const peers = new Map<number, PictorRunLobbyPeer>()
  let socket: WebSocket | null = null
  let mode = props.mode
  let status = props.status
  let emote = 0
  let lobbyX = 0
  let lobbyZ = 0
  let closed = false
  let retries = 0
  let retryTimer = 0
  let pingTimer = 0
  let lastMoveAt = 0
  let lastStampAt = 0
  let lastProgressAt = 0
  let lastProgress = 0

  const emit = () => props.onPeers([...peers.values()])

  const send = (message: unknown) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        typeof message === "string" ? message : JSON.stringify(message),
      )
    }
  }

  const open = async () => {
    if (closed) return
    // ログイン中なら、本人確認に使うトークンをあいさつに付ける（名前とアイコンはサーバーが調べる）
    let auth: string | undefined
    let wp: string | undefined
    try {
      const headers = await getViewerRequestHeaders({})
      auth = headers.authorization
      wp = headers["wp-user-id"]
    } catch {
      // 未ログインはゲストとして入る
    }
    if (closed) return
    const ws = new WebSocket(LOBBY_URL)
    socket = ws
    ws.onopen = () => {
      retries = 0
      ws.send(JSON.stringify({ t: "h", mode, auth, wp, st: status }))
      if (mode === "lobby") {
        ws.send(JSON.stringify({ t: "m", mode, x: lobbyX, z: lobbyZ }))
        if (emote !== 0) ws.send(JSON.stringify({ t: "a", a: emote }))
      }
    }
    ws.onmessage = (event) => {
      if (typeof event.data !== "string" || event.data === "pong") return
      let message: {
        t?: string
        c?: number
        p?: PictorRunLobbyPeer
        peers?: PictorRunLobbyPeer[]
        mode?: PictorRunLobbyMode
        x?: number
        z?: number
        y?: number
        f?: number
        s?: number
        a?: number
        st?: string | null
        d?: number
      }
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }
      if (message.t === "w") {
        peers.clear()
        for (const peer of message.peers ?? []) {
          peers.set(peer.c, {
            ...peer,
            a: peer.a ?? 0,
            st: peer.st ?? null,
            d: peer.d ?? 0,
          })
        }
      } else if (message.t === "j" && message.p) {
        peers.set(message.p.c, {
          ...message.p,
          a: message.p.a ?? 0,
          st: message.p.st ?? null,
          d: message.p.d ?? 0,
        })
      } else if (message.t === "l" && message.c !== undefined) {
        peers.delete(message.c)
      } else if (message.t === "e" && message.c !== undefined) {
        const peer = peers.get(message.c)
        if (!peer || typeof message.s !== "number") return
        if (typeof message.d === "number") peer.d = message.d
        props.onStamp(peer, message.s)
        if (typeof message.d !== "number") return
      } else if (message.c !== undefined) {
        const peer = peers.get(message.c)
        if (!peer) return
        if (message.t === "p") {
          peer.x = message.x ?? peer.x
          peer.z = message.z ?? peer.z
          peer.y = message.y ?? 0
          peer.f = message.f ?? peer.f
        } else if (message.t === "d") {
          peer.d = message.d ?? 0
        } else if (message.t === "a") {
          peer.a = message.a ?? 0
        } else if (message.t === "s") {
          peer.st = message.st ?? null
        } else if (message.t === "m" && message.mode) {
          peer.mode = message.mode
          peer.a = 0
          peer.d = 0
          peer.x = message.x ?? peer.x
          peer.z = message.z ?? peer.z
          peer.y = 0
        }
      }
      emit()
    }
    ws.onclose = () => {
      if (socket !== ws) return
      socket = null
      peers.clear()
      emit()
      if (closed || retries >= 4) return
      retries += 1
      retryTimer = window.setTimeout(() => void open(), 2000 * retries)
    }
  }
  void open()

  // 切れていないかの確認（サーバー側は自動で返すので、起こさない）
  pingTimer = window.setInterval(() => send("ping"), 40_000)

  return {
    setMode: (next, x = 0, z = 0) => {
      mode = next
      emote = 0
      lastProgress = 0
      lobbyX = x
      lobbyZ = z
      send({ t: "m", mode: next, x, z })
    },
    move: (x, z, y, f) => {
      lobbyX = x
      lobbyZ = z
      const now = Date.now()
      // 1 秒に 6 回まで
      if (now - lastMoveAt < 160) return
      lastMoveAt = now
      send({ t: "p", x, z, y, f })
    },
    stamp: (index, distance) => {
      const now = Date.now()
      if (now - lastStampAt < STAMP_INTERVAL_MS) return false
      lastStampAt = now
      send(
        distance === undefined
          ? { t: "e", s: index }
          : { t: "e", s: index, d: distance },
      )
      return true
    },
    progress: (distance) => {
      const now = Date.now()
      if (
        mode !== "run" ||
        now - lastProgressAt < 4000 ||
        Math.abs(distance - lastProgress) < 5
      ) {
        return
      }
      lastProgressAt = now
      lastProgress = distance
      send({ t: "d", d: distance })
    },
    emote: (next) => {
      if (next === emote) return
      emote = next
      send({ t: "a", a: next })
    },
    setStatus: (next) => {
      if (next === status) return
      status = next
      send({ t: "s", st: next })
    },
    close: () => {
      closed = true
      window.clearTimeout(retryTimer)
      window.clearInterval(pingTimer)
      socket?.close()
      socket = null
    },
  }
}
