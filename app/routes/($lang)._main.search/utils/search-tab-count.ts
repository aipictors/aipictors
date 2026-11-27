/** 検索結果のタブの横に出す件数（「123」「1,000+」）。数えていない・数えられないときは null */
export const formatSearchTabCount = (
  count: number | null | undefined,
  isAtLeast = false,
) =>
  count === null || count === undefined
    ? null
    : `${count.toLocaleString("en-US")}${isAtLeast ? "+" : ""}`
