import { describe, expect, test } from "bun:test"
import { toEnglishRequestNotification } from "~/utils/request-notification-text"

describe("有料リクエストの通知を英語にする", () => {
  test("API の日本語の文の種類ごとに英語の一文になる（タイトルはそのまま）", () => {
    const cases: [string, string][] = [
      [
        "あいさんからリクエスト「猫の絵」が届きました（200 コイン）。11/20 10:00までに承諾かお断りをしてください",
        'You received a new request "猫の絵"',
      ],
      [
        "あいさんがリクエスト「猫の絵」を承諾しました。納期は11/27です",
        'Request "猫の絵" was accepted',
      ],
      [
        "あいさんがリクエスト「猫の絵」をお断りしました。200 コインは全額返却されました",
        'Request "猫の絵" was declined. Your coins were fully returned',
      ],
      [
        "あいさんがリクエスト「猫の絵」をキャンセルしました",
        'Request "猫の絵" was canceled by the requester',
      ],
      [
        "あいさんからリクエスト「猫の絵」の納品が届きました。確認して「受け取り完了」を押してください",
        'The delivery for request "猫の絵" has arrived. Please review it',
      ],
      [
        "あいさんからリクエスト「猫の絵」の修正のお願いが届きました。新しい納期は11/30です",
        'A revision was requested for "猫の絵"',
      ],
      [
        "リクエスト「猫の絵」の取引が完了しました。受け取り: 報酬 45円",
        'Request "猫の絵" is complete',
      ],
      [
        "リクエスト「猫の絵」は運営によりキャンセルされました",
        'Request "猫の絵" was canceled by Aipictors',
      ],
      [
        "リクエスト「猫の絵」は期限までに承諾されなかったため取り消されました。200 コインは全額返却されました",
        'Request "猫の絵" expired because it was not accepted in time',
      ],
      [
        "リクエスト「猫の絵」の納期が近づいています（11/27まで）",
        'The due date for request "猫の絵" is coming up',
      ],
      [
        "あいさんからリクエスト「猫の絵」にメッセージ: よろしくお願いします",
        'New message on request "猫の絵"',
      ],
    ]
    for (const [ja, en] of cases)
      expect(toEnglishRequestNotification(ja)).toBe(en)
  })

  test("見分けられない文や空はひとことの英語", () => {
    expect(toEnglishRequestNotification(null)).toBe(
      "There is an update on your request",
    )
    expect(toEnglishRequestNotification("その他")).toBe(
      "There is an update on your request",
    )
  })
})
