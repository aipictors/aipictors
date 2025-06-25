import type { ComponentProps } from "react"
import type { WorksWhereInput } from "../types/works"
import type { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"

export const PER_IMG = 32
export const PER_VID = 8

type HomeWorksProps = ComponentProps<typeof HomeWorksSection>

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function chunkWorks<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  if (!arr || arr.length === 0) {
    return res
  }
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size))
  }
  return res
}

export function getPerPage(workType: HomeWorksProps["workType"]) {
  return workType === "VIDEO" ? PER_VID : PER_IMG
}

function getTimeRangeDates(range: HomeWorksProps["timeRange"] = "ALL") {
  const today0 = startOfDay(new Date())

  switch (range) {
    case "TODAY":
      return {
        createdAtAfter: today0.toISOString(),
        createdAtBefore: null,
        isNowCreatedAt: true,
      }
    case "YESTERDAY": {
      const yesterday0 = new Date(today0.getTime() - 86400000)
      return {
        createdAtAfter: yesterday0.toISOString(),
        createdAtBefore: today0.toISOString(),
      }
    }
    case "WEEK": {
      const day = today0.getDay()
      const diffMon = (day + 6) % 7
      const thisMon0 = new Date(today0.getTime() - diffMon * 86400000)
      const lastMon0 = new Date(thisMon0.getTime() - 7 * 86400000)
      return {
        createdAtAfter: lastMon0.toISOString(),
        createdAtBefore: thisMon0.toISOString(),
      }
    }
    default:
      return {
        createdAtAfter: null,
        createdAtBefore: null,
        isNowCreatedAt: true,
      }
  }
}

export function makeWhere(
  props: Omit<HomeWorksProps, "page" | "setPage">,
  anchorAt: string,
): WorksWhereInput {
  const { createdAtAfter, createdAtBefore, isNowCreatedAt } = getTimeRangeDates(
    props.timeRange,
  )

  const needAllMode = !props.timeRange || props.timeRange === "ALL"
  const needAnchor = needAllMode // ← 常に anchor 付ける

  // orderByが指定されていない場合はデフォルトをDATE_CREATEDに
  const orderBy = props.sortType ?? "DATE_CREATED"

  return {
    ratings: ["G", "R15"],
    ...(props.workType && { workType: props.workType }),
    ...(props.isPromptPublic !== null && {
      hasPrompt: props.isPromptPublic,
      isPromptPublic: props.isPromptPublic,
    }),
    orderBy,
    ...(props.style && { style: props.style }),
    ...(createdAtAfter && { createdAtAfter }),
    ...(createdAtBefore && { beforeCreatedAt: createdAtBefore }),
    ...(!createdAtBefore && needAnchor ? { beforeCreatedAt: anchorAt } : {}),
    ...(isNowCreatedAt ? { isNowCreatedAt: true } : {}),
  }
}
