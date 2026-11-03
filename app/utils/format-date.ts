const pad = (value: number, length: number) =>
  String(value).padStart(length, "0")

/**
 * 日付を「yyyy」「MM」「dd」「HH」「mm」「ss」の形に整える（ローカル時刻）。
 * 全ページの JS に入る表示用の関数なので、date-fns の format（と英語のロケール。合わせて約 60KB）を使わない
 * それ以外の書式（M 月・曜日など）が必要なページは date-fns を使う
 */
export const formatDate = (date: Date, pattern: string): string => {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid time value")
  }
  return pattern.replace(/yyyy|MM|dd|HH|mm|ss/g, (token) => {
    switch (token) {
      case "yyyy":
        return pad(date.getFullYear(), 4)
      case "MM":
        return pad(date.getMonth() + 1, 2)
      case "dd":
        return pad(date.getDate(), 2)
      case "HH":
        return pad(date.getHours(), 2)
      case "mm":
        return pad(date.getMinutes(), 2)
      default:
        return pad(date.getSeconds(), 2)
    }
  })
}
