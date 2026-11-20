/**
 * ダウンロードのファイル名に使う日本時間の時刻（YYYYMMDDHHMMSS）。
 * toISOString() は協定世界時なので、そのまま使うと日本時間より 9 時間前の名前になる
 */
export function toJstFileTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`
}
