/**
 * Push通知の設定ページで見せる状態
 * - unsupported: このブラウザでは使えない
 * - denied: ブラウザで通知がブロックされている
 * - off: どのブラウザにも届かない
 * - other-browser: 別のブラウザ（最後に設定したブラウザ）に届く
 * - on: このブラウザに届く
 */
export type PushStatus =
  | "checking"
  | "unsupported"
  | "denied"
  | "off"
  | "other-browser"
  | "on"

/** このブラウザで最後に登録したトークン（トークンが入れ替わったときに、別のブラウザと見分ける） */
export const LOCAL_TOKEN_KEY = "aipictors:web-fcm-token"

export const toPushStatus = (props: {
  isSupported: boolean
  permission: NotificationPermission | null
  serverToken: string | null
  /** このブラウザのトークン（許可されていて、まだ取っていなければ undefined） */
  currentToken: string | null | undefined
}): PushStatus => {
  if (!props.isSupported) return "unsupported"
  if (props.permission === "denied") return "denied"
  if (!props.serverToken) return "off"
  if (props.permission !== "granted") return "other-browser"
  if (props.currentToken === undefined) return "checking"
  return props.currentToken === props.serverToken ? "on" : "other-browser"
}

/**
 * このブラウザのトークンが入れ替わっただけ（前にこのブラウザで登録したものがサーバーに残っている）なら、
 * 新しいトークンで登録し直す
 */
export const shouldRefreshToken = (props: {
  serverToken: string | null
  currentToken: string | null | undefined
  localToken: string | null
}) => {
  if (!props.serverToken || !props.currentToken || !props.localToken) {
    return false
  }
  return (
    props.localToken === props.serverToken &&
    props.currentToken !== props.serverToken
  )
}

/** iPhone・iPad で、ホーム画面に追加せずにブラウザで開いている */
export const isIosBrowserTab = (userAgent: string, isStandalone: boolean) => {
  return /iPhone|iPad|iPod/.test(userAgent) && !isStandalone
}
