export type ModerationReportTab = "ACTION" | "INFO" | "DONE"

/**
 * 運営からのお知らせで最初に開くタブ
 * 対応が必要なものが無ければ「お知らせのみ」を開く（自動判定の区分変更と「判定が違う」はここにあるので、空のタブで見落とさないように）
 */
export const initialModerationReportTab = (
  counts: Record<ModerationReportTab, number>,
): ModerationReportTab => {
  if (counts.ACTION > 0) return "ACTION"
  if (counts.INFO > 0) return "INFO"
  return "ACTION"
}
