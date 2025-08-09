import { graphql, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext, useState, useCallback, useMemo } from "react"
import { tagWorksQuery } from "~/routes/($lang)._main.tags.$tag._index/route"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { TagFollowButton } from "~/components/button/tag-follow-button"
import { WorksListSortableSetting } from "~/routes/($lang).my._index/components/works-list-sortable-setting"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { useTranslation } from "~/hooks/use-translation"
import { SensitiveTagActionOther } from "~/routes/($lang)._main.tags._index/components/sensitive-tag-action-other"
import { Switch } from "~/components/ui/switch"
import { CompactFilter, type FilterValues } from "~/components/compact-filter"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  worksCount: number
  tag: string
  page: number
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  hasPrompt: number
  mode: "feed" | "pagination"
  setPage: (page: number) => void
  setMode: (mode: "feed" | "pagination") => void
  setAccessType?: (accessType: IntrospectionEnum<"AccessType"> | null) => void
  setWorkType: (workType: IntrospectionEnum<"WorkType"> | null) => void
  setRating: (rating: IntrospectionEnum<"Rating"> | null) => void
  setSort: (sort: SortType) => void
  setHasPrompt: (hasPrompt: number) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickAccessTypeSortButton: () => void
  onClickDateSortButton: () => void
  onClickWorkTypeSortButton: () => void
  onClickIsPromotionSortButton: () => void
}

type LocalFilterValues = {
  ageRestrictions: string[]
  aiUsage: string
  promptPublic: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  orderBy: string
  workModelId: string | undefined
  myWorksOnly?: boolean
}

export function SensitiveTagWorkSection(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  // フィルタ状態と更新関数
  const [filters, setFilters] = useState<LocalFilterValues>({
    ageRestrictions: [],
    aiUsage: "all",
    promptPublic: "all",
    dateFrom: undefined,
    dateTo: undefined,
    orderBy: "LIKES_COUNT",
    workModelId: undefined,
    myWorksOnly: false,
  })

  // CompactFilterとの互換性のため、型変換を行う関数
  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    console.log("Sensitive tag filters changed:", newFilters)
    setFilters({
      ageRestrictions: newFilters.ageRestrictions,
      aiUsage: newFilters.aiUsage,
      promptPublic: newFilters.promptPublic,
      dateFrom: newFilters.dateFrom,
      dateTo: newFilters.dateTo,
      orderBy: newFilters.orderBy || "LIKES_COUNT",
      workModelId: newFilters.workModelId,
      myWorksOnly: newFilters.myWorksOnly || false,
    })
  }, [])

  // フィルタ適用時の処理
  const handleFiltersApply = useCallback(() => {
    console.log("Sensitive tag filters applied")
    props.setPage(0) // ページをリセット
  }, [props])

  // フィルタ適用時の where 条件を生成
  const getFilteredWhereCondition = useCallback(() => {
    const baseWhere: {
      tagNames: string[]
      orderBy: IntrospectionEnum<"WorkOrderBy">
      sort: SortType
      ratings: ("G" | "R15" | "R18" | "R18G")[]
      hasPrompt?: boolean
      isPromptPublic?: boolean
      isNowCreatedAt: boolean
      modelPostedIds?: string[]
      createdAtAfter?: string
      beforeCreatedAt?: string
      isSensitive: boolean
      userId?: string
    } = {
      tagNames: [
        decodeURIComponent(props.tag),
        decodeURIComponent(props.tag).toLowerCase(),
        decodeURIComponent(props.tag).toUpperCase(),
        decodeURIComponent(props.tag).replace(/[\u30A1-\u30F6]/g, (m) =>
          String.fromCharCode(m.charCodeAt(0) - 96),
        ),
        decodeURIComponent(props.tag).replace(/[\u3041-\u3096]/g, (m) =>
          String.fromCharCode(m.charCodeAt(0) + 96),
        ),
      ],
      orderBy: props.orderBy,
      sort: props.sort,
      ratings: ["R18", "R18G"] as ("G" | "R15" | "R18" | "R18G")[],
      hasPrompt: props.hasPrompt === 1 ? true : undefined,
      isPromptPublic: props.hasPrompt === 1 ? true : undefined,
      isNowCreatedAt: true,
      isSensitive: true,
    }

    // 自分の作品のみフィルタ
    if (filters.myWorksOnly && authContext.userId) {
      baseWhere.userId = authContext.userId
    }

    // AIモデルフィルタ
    if (filters.workModelId) {
      baseWhere.modelPostedIds = [filters.workModelId]
    }

    // 年齢制限フィルタ（R18の場合は元々制限されているので、さらに制限する場合のみ）
    if (filters.ageRestrictions.length > 0) {
      const filteredRatings = filters.ageRestrictions.filter(
        (rating) => rating === "R18" || rating === "R18G",
      ) as ("R18" | "R18G")[]
      if (filteredRatings.length > 0) {
        baseWhere.ratings = filteredRatings
      }
    }

    // プロンプト公開フィルタ
    if (filters.promptPublic === "public") {
      baseWhere.hasPrompt = true
      baseWhere.isPromptPublic = true
    } else if (filters.promptPublic === "private") {
      baseWhere.hasPrompt = false
      baseWhere.isPromptPublic = false
    }

    // 期間フィルタ
    if (filters.dateFrom) {
      baseWhere.createdAtAfter = filters.dateFrom.toISOString()
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo)
      endDate.setHours(23, 59, 59, 999)
      baseWhere.beforeCreatedAt = endDate.toISOString()
    }

    return baseWhere
  }, [
    props.tag,
    props.orderBy,
    props.sort,
    props.hasPrompt,
    filters,
    authContext.userId,
  ])

  const compactFilterValues: FilterValues = useMemo(
    () => ({
      ageRestrictions: filters.ageRestrictions,
      aiUsage: filters.aiUsage,
      promptPublic: filters.promptPublic,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      orderBy: filters.orderBy,
      workModelId: filters.workModelId,
      myWorksOnly: filters.myWorksOnly,
    }),
    [filters],
  )

  const { data = null } = useQuery(viewerFollowedTagsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { offset: 0, limit: 32 },
  })

  const {
    data: resp,
    loading: isLoading,
    error: _error,
  } = useQuery(tagWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: getFilteredWhereCondition(),
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network", // フィルタ変更時に再フェッチを確実に行う
  })

  const works = resp?.tagWorks ?? props.works

  const firstWork = works.length ? works[0] : null

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  const isFollowedTag = data?.viewer?.followingTags.some(
    (tag) => tag.name === props.tag,
  )

  return (
    <div className="flex flex-col space-y-6">
      <div className="relative h-32">
        {firstWork?.smallThumbnailImageURL && (
          <div className="relative h-16 w-full overflow-hidden">
            <img
              src={firstWork.smallThumbnailImageURL}
              alt={`${props.tag}のサムネイル`}
              className="h-full w-full object-cover opacity-50"
            />
          </div>
        )}
        <div className="absolute top-8 left-0">
          <div className="flex space-x-4">
            <div className="rounded-md border-2 border-white">
              {firstWork && (
                <CroppedWorkSquare
                  workId={firstWork.id}
                  imageUrl={firstWork.smallThumbnailImageURL}
                  thumbnailImagePosition={firstWork.thumbnailImagePosition ?? 0}
                  size="sm"
                  imageWidth={firstWork.smallThumbnailImageWidth}
                  imageHeight={firstWork.smallThumbnailImageHeight}
                />
              )}
            </div>
            <div className="mt-auto space-y-1">
              <h2 className="font-semibold text-gray-800 text-xl dark:text-gray-200">
                {props.tag}
                {t("の作品", " works")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {props.worksCount}
                {t("件の作品が見つかりました", " works found")}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <GoogleCustomSearch /> */}
      <div className="relative flex items-center">
        <div className="hidden items-center space-x-2 md:flex">
          <div className="min-w-32">
            <WorksListSortableSetting
              nowSort={props.sort}
              nowOrderBy={props.orderBy}
              allOrderBy={allSortType}
              setSort={props.setSort}
              onClickTitleSortButton={props.onClickTitleSortButton}
              onClickLikeSortButton={props.onClickLikeSortButton}
              onClickBookmarkSortButton={props.onClickBookmarkSortButton}
              onClickCommentSortButton={props.onClickCommentSortButton}
              onClickViewSortButton={props.onClickViewSortButton}
              onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
              onClickDateSortButton={props.onClickDateSortButton}
              onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
              onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
            />
          </div>
          <CompactFilter
            filters={compactFilterValues}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleFiltersApply}
            isLoading={isLoading}
          />
          <div className="min-w-32">
            <div className="flex items-center space-x-2">
              <Switch
                onClick={() => {
                  props.setHasPrompt(props.hasPrompt === 1 ? 0 : 1)
                }}
                checked={props.hasPrompt === 1}
              />
              <span className="text-sm">
                {t("プロンプト有", "With Prompts")}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex w-full items-center space-x-4 md:w-64">
          <TagFollowButton
            className="w-full"
            tag={props.tag}
            isFollow={isFollowedTag ?? false}
          />
          <SensitiveTagActionOther tag={props.tag} />
        </div>
      </div>
      <div className="flex items-center space-x-2 md:hidden">
        <div className="min-w-32">
          <WorksListSortableSetting
            nowSort={props.sort}
            nowOrderBy={props.orderBy}
            allOrderBy={allSortType}
            setSort={props.setSort}
            onClickTitleSortButton={props.onClickTitleSortButton}
            onClickLikeSortButton={props.onClickLikeSortButton}
            onClickBookmarkSortButton={props.onClickBookmarkSortButton}
            onClickCommentSortButton={props.onClickCommentSortButton}
            onClickViewSortButton={props.onClickViewSortButton}
            onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
            onClickDateSortButton={props.onClickDateSortButton}
            onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
            onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
          />
        </div>
        <CompactFilter
          filters={compactFilterValues}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleFiltersApply}
          isLoading={isLoading}
        />
        <div className="min-w-32">
          <div className="flex items-center space-x-2">
            <Switch
              onClick={() => {
                props.setHasPrompt(props.hasPrompt === 1 ? 0 : 1)
              }}
              checked={props.hasPrompt === 1}
            />
            <span className="text-sm">{t("プロンプト有", "With Prompts")}</span>
          </div>
        </div>
      </div>
      <ResponsivePhotoWorksAlbum works={works} isShowProfile={true} />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          maxCount={Number(props.worksCount)}
          perPage={32}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </div>
  )
}

const viewerFollowedTagsQuery = graphql(
  `query ViewerFollowedTags($offset: Int!, $limit: Int!) {
    viewer {
      id
      followingTags(offset: $offset, limit: $limit) {
        id
        name
      }
    }
  }`,
)
