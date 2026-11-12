import { toDateText } from "~/utils/to-date-text"

/**
 * お試しの終わりの日付。日本語は日本時間、英語は見ている人の地域の時刻で出す
 */
export const toTrialDateText = (unixSeconds: number, isEnglish: boolean) =>
  isEnglish
    ? new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : toDateText(unixSeconds)
