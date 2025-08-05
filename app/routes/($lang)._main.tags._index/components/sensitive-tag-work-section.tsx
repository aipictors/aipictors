import { graphql, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext, useState, useCallback } from "react"
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
  setPage: (page: number) => void
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

export function SensitiveTagWorkSection(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  // フィルタ状態と更新関数
  const [filters, setFilters] = useState({
    ageRestrictions: [] as string[],
    aiUsage: "all",
    promptPublic: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    orderBy: "LIKES_COUNT",
    aiName: "", // AIモデル名検索用
  })

  // CompactFilterとの互換性のため、型変換を行う関数
  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters({
      ageRestrictions: newFilters.ageRestrictions,
      aiUsage: newFilters.aiUsage,
      promptPublic: newFilters.promptPublic,
      dateFrom: newFilters.dateFrom,
      dateTo: newFilters.dateTo,
      orderBy: newFilters.orderBy || "LIKES_COUNT",
      aiName: newFilters.aiUsage || "",
    })
  }, [])

  // フィルタ適用時の処理
  const handleFiltersApply = useCallback(() => {
    props.setPage(0) // ページをリセット
  }, [props])

  const { data = null } = useQuery(viewerFollowedTagsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { offset: 0, limit: 32 },
  })

  const {
    data: resp,
    loading: _loading,
    error: _error,
  } = useQuery(tagWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
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
        ratings: ["R18", "R18G"],
        isSensitive: true,
        hasPrompt: props.hasPrompt === 1 ? true : undefined,
        isPromptPublic: props.hasPrompt === 1 ? true : undefined,
        isNowCreatedAt: true,
      },
    },
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
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
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleFiltersApply}
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
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleFiltersApply}
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
