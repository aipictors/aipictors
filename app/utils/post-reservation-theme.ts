import { getJstDate } from "~/utils/jst-date"

/**
 * 日本時間の今日の日付（YYYY-MM-DD）
 */
export const toJstDateString = (date?: Date) => {
  const jst = getJstDate(date)
  const year = jst.getFullYear()
  const month = String(jst.getMonth() + 1).padStart(2, "0")
  const day = String(jst.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * 予約投稿の日付を変えたあとのお題の選択
 * お題はその日ごとなので、日付が変わったときだけ選択を外す。
 * 日付が同じまま（時刻だけ入れた・今日の日付を選び直した）ときは選択を残す
 */
export const nextThemeIdForReservationDate = (props: {
  themeId: string | null
  previousDate: string | null
  nextDate: string | null
  todayDate: string
}) => {
  const previous = props.previousDate ?? props.todayDate
  const next = props.nextDate ?? props.todayDate
  return previous === next ? props.themeId : null
}
