/**
 * 運営からのお知らせ（修正依頼）の種類ごとの説明と、やること
 */

export type ModerationReportGuide = {
  /** 短い見出し */
  title: string
  /** 何をすればよいか（手順） */
  steps: string[]
  /** 作品を直す必要があるか（区分の変更だけなら不要） */
  needsFix: boolean
  /** 画像のモザイクの道具を案内するか */
  suggestsMosaic: boolean
}

const MOSAIC_STEPS = [
  "編集画面の画像の左下にあるペンのボタン（モザイク）で、該当の箇所を隠します（性器・結合部は輪郭が見えないように、長辺の 1/100 以上の大きさのモザイク）",
  "問題のある画像だけを外したいときは、その画像の右上の × で削除できます",
  "「更新」を押すと、運営に修正完了が自動で届き、一時非公開も解除されます",
]

const REMOVE_STEPS = [
  "問題のある画像の右上の × で削除するか、別の画像に差し替えます（画像を追加して並べ替えできます）",
  "すべてが該当する場合は、作品を削除してください",
  "「更新」を押すと、運営に修正完了が自動で届きます",
]

export function getModerationReportGuide(
  reportType: string | null | undefined,
): ModerationReportGuide {
  switch (reportType) {
    case "NEED_MOSAIC":
    case "UNEDITED_GENITALS":
      return {
        title: "モザイクが足りていません",
        steps: MOSAIC_STEPS,
        needsFix: true,
        suggestsMosaic: true,
      }
    case "INAPPROPRIATE_RATING":
      return {
        title: "年齢区分（全年齢・R-15・R-18・R-18G）を運営が変更しました",
        steps: [
          "作品は新しい区分で公開されたままです。直す必要はありません",
          "区分の目安は R-18 追加規約（https://www.aipictors.com/terms/r18 ）をご覧ください",
        ],
        needsFix: false,
        suggestsMosaic: false,
      }
    case "INAPPROPRIATE_STYLE":
      return {
        title: "作品の種類（イラスト・リアルなど）を運営が変更しました",
        steps: ["作品は公開されたままです。直す必要はありません"],
        needsFix: false,
        suggestsMosaic: false,
      }
    case "CHILD_PORNOGRAPHY":
      return {
        title: "児童ポルノと誤認されるおそれがあります",
        steps: [
          "18 歳未満に見える人物の性的な表現は、年齢区分にかかわらず投稿できません",
          ...REMOVE_STEPS,
        ],
        needsFix: true,
        suggestsMosaic: false,
      }
    case "COPYRIGHT_VIOLATION":
      return {
        title: "著作権を侵害しているおそれがあります",
        steps: REMOVE_STEPS,
        needsFix: true,
        suggestsMosaic: false,
      }
    case "RED_CROSS_VIOLATION":
      return {
        title: "赤十字マークが使われています",
        steps: [
          "赤十字マークは法律で使えません。色を変えるか、モザイクで隠してください",
          ...MOSAIC_STEPS.slice(1),
        ],
        needsFix: true,
        suggestsMosaic: true,
      }
    case "ADVERTISEMENT_VIOLATION":
      return {
        title: "宣伝・勧誘が含まれています",
        steps: [
          "説明文・リンク・画像から、商業的な宣伝や勧誘を取り除いてください",
          "「更新」を押すと、運営に修正完了が自動で届きます",
        ],
        needsFix: true,
        suggestsMosaic: false,
      }
    case "ILLEGAL_CONTENT_GUIDELINE_VIOLATION":
      return {
        title: "禁止されているコンテンツへの誘導があります",
        steps: [
          "説明文・リンクから、該当する誘導を取り除いてください",
          "「更新」を押すと、運営に修正完了が自動で届きます",
        ],
        needsFix: true,
        suggestsMosaic: false,
      }
    case "SERVER_WARNING":
      return {
        title: "運営からの注意があります",
        steps: [
          "内容を確認し、必要なら作品を編集してください",
          "「更新」を押すと、運営に修正完了が自動で届きます",
        ],
        needsFix: true,
        suggestsMosaic: false,
      }
    default:
      return {
        title: "運営からのお知らせがあります",
        steps: [
          "内容を確認し、必要なら作品を編集してください",
          "「更新」を押すと、運営に修正完了が自動で届きます",
        ],
        needsFix: true,
        suggestsMosaic: false,
      }
  }
}

/**
 * 編集の内容から、運営への修正完了の報告文を作る（ユーザーが書かなくても届くように）
 */
export function buildCorrectionMessage(props: {
  userMessage: string
  removedImageCount: number
  addedImageCount: number
  isRatingChanged: boolean
}) {
  const parts: string[] = []
  if (props.removedImageCount > 0) {
    parts.push(`画像を${props.removedImageCount}枚削除しました`)
  }
  if (props.addedImageCount > 0) {
    parts.push(`画像を${props.addedImageCount}枚追加・差し替えました`)
  }
  if (props.isRatingChanged) {
    parts.push("年齢区分を変更しました")
  }
  const summary =
    parts.length > 0 ? parts.join("・") : "編集画面から作品を修正しました"
  const message = props.userMessage.trim()
  return message.length > 0 ? `${message}（${summary}）` : summary
}
