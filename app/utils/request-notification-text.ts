/**
 * 有料リクエストの通知は API が日本語の文で保存している（aipictors-api src/lib/coin-requests/notify.ts）。
 * 英語の画面では、文の種類を見分けて英語の一文にする（依頼のタイトルは「」の中をそのまま使う）
 */
const PATTERNS: [RegExp, (title: string) => string][] = [
  [/にメッセージ:/, (title) => `New message on request ${title}`],
  [
    /運営によりキャンセル/,
    (title) => `Request ${title} was canceled by Aipictors`,
  ],
  [
    /納期を過ぎたため自動でキャンセル/,
    (title) =>
      `Request ${title} was canceled automatically because it was overdue`,
  ],
  [
    /承諾されなかったため取り消され|承諾の期限を過ぎたため取り消され/,
    (title) => `Request ${title} expired because it was not accepted in time`,
  ],
  [
    /承諾の期限が近づいて/,
    (title) => `The response deadline for request ${title} is coming up`,
  ],
  [
    /納期が近づいて/,
    (title) => `The due date for request ${title} is coming up`,
  ],
  [/取引が完了/, (title) => `Request ${title} is complete`],
  [/修正のお願い/, (title) => `A revision was requested for ${title}`],
  [
    /納品が届きました/,
    (title) =>
      `The delivery for request ${title} has arrived. Please review it`,
  ],
  [
    /をお断りしました/,
    (title) => `Request ${title} was declined. Your coins were fully returned`,
  ],
  [
    /をキャンセルしました/,
    (title) => `Request ${title} was canceled by the requester`,
  ],
  [/を承諾しました/, (title) => `Request ${title} was accepted`],
  [
    /リクエスト.*が届きました/,
    (title) => `You received a new request ${title}`,
  ],
]

export const toEnglishRequestNotification = (message: string | null) => {
  const text = message ?? ""
  const match = text.match(/「([^」]*)」/)
  const title = match ? `"${match[1]}"` : ""
  for (const [pattern, toText] of PATTERNS) {
    if (pattern.test(text)) return toText(title).replace(/\s+/g, " ").trim()
  }
  return "There is an update on your request"
}
