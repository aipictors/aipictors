import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * ミニゲーム「ぴくたーちゃんラン」のロビー（休憩場）のリアルタイム通信。
 * いま遊んでいる人・ロビーにいる人と、ロビーで動かしているぴくたーちゃんの位置をやりとりする。
 * サーバーは lobby.aipictors.com（Durable Object。だれも動いていない間は料金がかからない作り）
 */

const LOBBY_URL = "wss://lobby.aipictors.com/ws"

export type PictorRunLobbyMode = "run" | "lobby"

export type PictorRunLobbyPeer = {
  /** 接続の番号 */
  c: number
  /** ログイン中の人の番号（ゲストは null） */
  id: string | null
  name: string
  icon: string | null
  mode: PictorRunLobbyMode
  x: number
  y: number
  /** 向き（1 = 右、-1 = 左） */
  f: number
}

export type PictorRunLobbyConnection = {
  /** ロビーに入った・走りに戻った */
  setMode: (mode: PictorRunLobbyMode, x?: number) => void
  /** ロビーでの自分の位置（動いたときだけ呼ぶ） */
  move: (x: number, y: number, f: number) => void
  close: () => void
}

/**
 * ロビーにつなぐ。つながらなくても遊べるので、失敗は黙って何度かやり直すだけにする
 */
export function connectPictorRunLobby(props: {
  mode: PictorRunLobbyMode
  onPeers: (peers: PictorRunLobbyPeer[]) => void
}): PictorRunLobbyConnection {
  const peers = new Map<number, PictorRunLobbyPeer>()
  let socket: WebSocket | null = null
  let mode = props.mode
  let lobbyX = 0
  let closed = false
  let retries = 0
  let retryTimer = 0
  let pingTimer = 0
  let lastMoveAt = 0

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
      ws.send(JSON.stringify({ t: "h", mode, auth, wp }))
      if (mode === "lobby") ws.send(JSON.stringify({ t: "m", mode, x: lobbyX }))
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
        y?: number
        f?: number
      }
      try {
        message = JSON.parse(event.data)
      } catch {
        return
      }
      if (message.t === "w") {
        peers.clear()
        for (const peer of message.peers ?? []) peers.set(peer.c, peer)
      } else if (message.t === "j" && message.p) {
        peers.set(message.p.c, message.p)
      } else if (message.t === "l" && message.c !== undefined) {
        peers.delete(message.c)
      } else if (message.c !== undefined) {
        const peer = peers.get(message.c)
        if (!peer) return
        if (message.t === "p") {
          peer.x = message.x ?? peer.x
          peer.y = message.y ?? 0
          peer.f = message.f ?? peer.f
        } else if (message.t === "m" && message.mode) {
          peer.mode = message.mode
          peer.x = message.x ?? peer.x
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
    setMode: (next, x = 0) => {
      mode = next
      lobbyX = x
      send({ t: "m", mode: next, x })
    },
    move: (x, y, f) => {
      lobbyX = x
      const now = Date.now()
      // 1 秒に 6 回まで
      if (now - lastMoveAt < 160) return
      lastMoveAt = now
      send({ t: "p", x, y, f })
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
