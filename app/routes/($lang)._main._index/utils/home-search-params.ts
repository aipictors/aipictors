import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { HomeTab } from "~/routes/($lang)._main._index/utils/home-tabs"

// URLパラメータから初期値を取得する関数（SSR対応）
export const getInitialPageValue = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return 0
  const page = searchParams.get("page")
  const pageNumber = page ? Number.parseInt(page, 10) : 0
  return !Number.isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= 100
    ? pageNumber
    : 0
}

export const getInitialWorkType = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return null
  const wtParam = searchParams.get("workType")
  return wtParam && wtParam !== "ALL"
    ? (wtParam as IntrospectionEnum<"WorkType">)
    : null
}

export const getInitialIsPromptPublic = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return null
  const isPromptParam = searchParams.get("isPromptPublic")
  if (isPromptParam === "true") return true
  if (isPromptParam === "false") return false
  return null
}

export const getInitialSortType = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return null
  const sortTypeParam = searchParams.get("sortType")
  if (
    sortTypeParam === "DATE_CREATED" ||
    sortTypeParam === "LIKES_COUNT" ||
    sortTypeParam === "COMMENTS_COUNT"
  ) {
    return sortTypeParam as IntrospectionEnum<"WorkOrderBy">
  }
  return null
}

export const getInitialTimeRange = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return "ALL"
  const tr = searchParams.get("timeRange")
  return tr && tr !== "ALL" ? tr : "ALL"
}

export const getInitialIsOneWorkPerUser = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return false
  const isOneWorkPerUserParam = searchParams.get("isOneWorkPerUser")
  return isOneWorkPerUserParam === "true"
}

export const getInitialWorkView = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return "new"
  const viewParam = searchParams.get("view")
  return viewParam || "new"
}

export const getInitialIsPagination = (searchParams: URLSearchParams) => {
  if (typeof window === "undefined") return true
  const isPaginationParam = searchParams.get("isPagination")
  if (isPaginationParam === "false") return false
  return true
}

/**
 * タブ・ページ番号などの状態を URL のパラメータに書き込む（渡した params を書き換える）
 */
export const buildHomeTabSearchParams = (
  newSearchParams: URLSearchParams,
  props: {
    currentTab: HomeTab
    newWorksPage: number
    followUserFeedPage: number
    followTagFeedPage: number
    timeRange: string
    workView: string
    internalIsPagination: boolean
    isOneWorkPerUser: boolean
  },
) => {
  const {
    currentTab,
    newWorksPage,
    followUserFeedPage,
    followTagFeedPage,
    timeRange,
    workView,
    internalIsPagination,
    isOneWorkPerUser,
  } = props

  // ページ
  if (currentTab === "new") {
    if (newWorksPage === 0) {
      newSearchParams.delete("page")
    } else {
      newSearchParams.set("page", newWorksPage.toString())
    }
  } else if (currentTab === "follow-user") {
    if (followUserFeedPage === 0) {
      newSearchParams.delete("page")
    } else {
      newSearchParams.set("page", followUserFeedPage.toString())
    }
  } else if (currentTab === "follow-tag") {
    if (followTagFeedPage === 0) {
      newSearchParams.delete("page")
    } else {
      newSearchParams.set("page", followTagFeedPage.toString())
    }
  } else {
    newSearchParams.delete("page")
  }

  // 期間指定
  if (currentTab === "new") {
    if (timeRange === "ALL") {
      newSearchParams.delete("timeRange")
    } else {
      newSearchParams.set("timeRange", timeRange)
    }
  } else {
    newSearchParams.delete("timeRange")
  }

  if (currentTab === "new") {
    if (workView === "new") {
      newSearchParams.delete("view")
    } else {
      newSearchParams.set("view", workView)
    }
  } else {
    newSearchParams.delete("view")
  }

  if (internalIsPagination) {
    newSearchParams.delete("isPagination")
  } else {
    newSearchParams.set("isPagination", "false")
  }

  // ユーザー毎に1作品フィルター
  if (currentTab === "new") {
    if (isOneWorkPerUser) {
      newSearchParams.set("isOneWorkPerUser", "true")
    } else {
      newSearchParams.delete("isOneWorkPerUser")
    }
  } else {
    newSearchParams.delete("isOneWorkPerUser")
  }
}
