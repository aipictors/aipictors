import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { getTimeRangeDates } from "~/routes/($lang)._main._index/utils/works-utils"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  originalOnlyWhere,
  useHomeOriginalOnly,
} from "~/routes/($lang)._main._index/hooks/use-original-only"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "~/routes/($lang)._main._index/components/home-novels-works-section"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "~/routes/($lang)._main._index/components/home-video-works-section"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"

type Props = {
  isCropped?: boolean
  initialWorks?: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  page: number
  setPage: (page: number) => void
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  timeRange?: string
  style?: IntrospectionEnum<"ImageStyle">
  isOneWorkPerUser?: boolean
  autoPlayVideoPreview?: boolean
  onSelect?: (index: string) => void
  updateWorks: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

/**
 * トップ画面ホーム作品一覧（画像・小説・動画）
 */
export function HomePaginationWorksSection(props: Props) {
  const appContext = useContext(AuthContext)

  const viewerRatings = useViewerRatings()
  const { isOriginalOnly } = useHomeOriginalOnly()

  // SSR の初期作品は未ログイン状態で取得し CDN にキャッシュされているため、
  // ミュート・ブロック・R15表示設定が反映されていない。ログイン中は使わない。
  const canUseInitialWorks =
    !appContext.isLoggedIn &&
    props.page === 0 &&
    props.workType === null &&
    props.isPromptPublic === null &&
    props.sortType === null &&
    (props.timeRange === undefined || props.timeRange === "ALL") &&
    !props.style &&
    !props.isOneWorkPerUser &&
    !isOriginalOnly &&
    (props.initialWorks?.length ?? 0) > 0

  // 1ページあたりの件数（映像は少なめに）
  const perPageCount = props.workType === "VIDEO" ? 8 : 32

  // 期間指定から createdAtAfter/before を算出（無限スクロールと同じ。「先週」は先週の月〜日）
  const { createdAtAfter, createdAtBefore } = getTimeRangeDates(
    props.timeRange || "ALL",
  )

  const { data: worksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading || canUseInitialWorks || !viewerRatings.isReady,
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    variables: {
      offset: props.page * perPageCount,
      limit: perPageCount,
      where: {
        ratings: viewerRatings.normalRatings,
        // 「公開（新着無）」の作品は新着一覧に出さない
        accessTypes: ["PUBLIC"],
        ...(props.workType !== null && {
          workType: props.workType,
        }),
        ...(props.isPromptPublic !== null && {
          hasPrompt: props.isPromptPublic,
          isPromptPublic: props.isPromptPublic,
        }),
        // デフォルトは新着順
        ...((props.sortType !== null && {
          orderBy: props.sortType,
        }) || { orderBy: "DATE_CREATED" }),

        ...(props.style && {
          style: props.style,
        }),
        ...(props.isOneWorkPerUser && { isOneWorkPerUser: true }),
        // 「オリジナルのみ」（オリジナル系のタグのどれかが付いた作品）
        ...originalOnlyWhere(isOriginalOnly),
        ...(!createdAtAfter && !createdAtBefore && { isNowCreatedAt: true }),

        // ★ 期間指定
        ...(createdAtAfter && { createdAtAfter: createdAtAfter }),
        ...(createdAtBefore && { beforeCreatedAt: createdAtBefore }),
      },
    },
  })

  const displayedWorks = canUseInitialWorks
    ? (props.initialWorks ?? [])
    : (worksResp?.works ?? [])

  useEffect(() => {
    if (displayedWorks.length > 0) {
      props.updateWorks(displayedWorks)
    }
  }, [displayedWorks, props])

  // ページを移る欄（一覧の上と下に同じものを置く）
  const pagination = (
    <ResponsivePagination
      perPage={perPageCount}
      maxCount={1000}
      currentPage={props.page}
      onPageChange={(page) => props.setPage(page)}
      showPageJump={true}
    />
  )

  return (
    <div className="space-y-4">
      {/* 先のページへ行くときに一覧の下までスクロールしなくて済むよう、上にも置く */}
      {displayedWorks.length > 0 && (
        <div className="flex justify-center pb-2">{pagination}</div>
      )}
      {/* 画像 or 全部 */}
      {(props.workType === "WORK" || props.workType === null) && (
        <HomeWorkSection
          title={""}
          works={displayedWorks}
          isCropped={props.isCropped}
          isShowProfile={true}
          autoPlayVideoPreview={props.autoPlayVideoPreview}
          priorityCount={canUseInitialWorks ? 4 : 0}
          onSelect={props.onSelect}
        />
      )}
      {/* 小説/コラム */}
      {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
        <HomeNovelsWorksSection
          title={""}
          works={displayedWorks}
          onSelect={props.onSelect}
        />
      )}
      {/* 動画 */}
      {props.workType === "VIDEO" && (
        <HomeVideosWorksSection
          title={""}
          works={displayedWorks}
          isAutoPlay={true}
          onSelect={props.onSelect}
        />
      )}

      {/* ページ送りは一覧の下に置く（画面下に固定すると作品に重なっていた） */}
      <div className="flex justify-center border-t pt-4 pb-6">{pagination}</div>
    </div>
  )
}

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWork
      ...HomeNovelsWorkListItem
      ...HomeVideosWorkListItem
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)
