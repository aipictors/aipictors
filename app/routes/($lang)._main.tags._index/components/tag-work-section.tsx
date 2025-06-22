import { graphql, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useApolloClient, useQuery } from "@apollo/client/index"
import {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react"
import { tagWorksQuery } from "~/routes/($lang)._main.tags.$tag._index/route"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { TagFollowButton } from "~/components/button/tag-follow-button"
import { TagActionOther } from "~/routes/($lang)._main.tags._index/components/tag-action-other"
import { WorksListSortableSetting } from "~/routes/($lang).my._index/components/works-list-sortable-setting"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { useTranslation } from "~/hooks/use-translation"
import { Switch } from "~/components/ui/switch"
import { Button } from "~/components/ui/button"
import { GoogleCustomSearch } from "~/components/google-custom-search"
import { Grid, List } from "lucide-react"

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

export function TagWorkSection(props: Props) {
  const authContext = useContext(AuthContext)
  const client = useApolloClient()

  // 表示モード状態
  const [isPagination, setIsPagination] = useState(props.mode === "pagination")

  // 無限スクロール用の状態
  const [infinitePages, setInfinitePages] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[][]
  >([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  // 状態管理用のキー
  const stateKey = `tag-works-${props.tag}-${props.orderBy}-${props.sort}-${props.hasPrompt}`

  const t = useTranslation()

  // props.mode の変更を監視して内部状態を同期
  useEffect(() => {
    setIsPagination(props.mode === "pagination")
  }, [props.mode])

  // キャッシュから初期データを取得（フィードモード用）
  const cachedInitialPages = useMemo(() => {
    if (isPagination) return []

    try {
      const cached = client.readQuery({
        query: tagWorksQuery,
        variables: {
          offset: 0,
          limit: 32,
          where: {
            tagNames: [props.tag],
            orderBy: props.orderBy,
            sort: props.sort,
            ratings: ["G", "R15"],
            hasPrompt: props.hasPrompt === 1 ? true : undefined,
            isPromptPublic: props.hasPrompt === 1 ? true : undefined,
            isNowCreatedAt: true,
          },
        },
      })
      return cached?.tagWorks?.length ? [cached.tagWorks] : []
    } catch {
      return []
    }
  }, [
    client,
    props.tag,
    props.orderBy,
    props.sort,
    props.hasPrompt,
    isPagination,
  ])

  // フォロー中のタグを取得
  const { data: followedTagsData = null } = useQuery(viewerFollowedTagsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { offset: 0, limit: 32 },
  })

  // ページネーション用のクエリ
  const {
    data: paginationResp,
    loading: paginationLoading,
    error: paginationError,
  } = useQuery(tagWorksQuery, {
    skip: !isPagination || authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        tagNames: [props.tag],
        orderBy: props.orderBy,
        sort: props.sort,
        ratings: ["G", "R15"],
        hasPrompt: props.hasPrompt === 1 ? true : undefined,
        isPromptPublic: props.hasPrompt === 1 ? true : undefined,
        isNowCreatedAt: true,
      },
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  })

  // 無限スクロール用のクエリ
  const {
    data: infiniteResp,
    loading: infiniteLoading,
    fetchMore,
  } = useQuery(tagWorksQuery, {
    skip: isPagination || authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        tagNames: [props.tag],
        orderBy: props.orderBy,
        sort: props.sort,
        ratings: ["G", "R15"],
        hasPrompt: props.hasPrompt === 1 ? true : undefined,
        isPromptPublic: props.hasPrompt === 1 ? true : undefined,
        isNowCreatedAt: true,
      },
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  })

  // スクロール位置復元（ページネーションモード）
  useEffect(() => {
    if (isPagination && typeof window !== "undefined") {
      const savedScrollY = sessionStorage.getItem(
        `scroll-pagination-${stateKey}-${props.page}`,
      )
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo(0, Number.parseInt(savedScrollY, 10))
        }, 100)
      }
    }
  }, [isPagination, stateKey, props.page])

  // ページネーションモードでのスクロール位置保存
  useEffect(() => {
    if (!isPagination) return

    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll-pagination-${stateKey}-${props.page}`,
        window.scrollY.toString(),
      )
    }

    const handleBeforeUnload = () => saveScrollPosition()
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      saveScrollPosition()
    }
  }, [isPagination, stateKey, props.page])

  // フィードモード用のデータ初期化
  useEffect(() => {
    if (isPagination) return

    // 初期ページデータを設定
    if (cachedInitialPages.length > 0 && infinitePages.length === 0) {
      setInfinitePages(cachedInitialPages)
      setHasNextPage(cachedInitialPages[0].length === 32)
      // スクロール位置復元
      const savedScrollY = sessionStorage.getItem(`scroll-infinite-${stateKey}`)
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo(0, Number.parseInt(savedScrollY, 10))
        }, 100)
      }
      return
    }

    // 新しいデータが取得された場合
    if (infiniteResp?.tagWorks && infinitePages.length === 0) {
      setInfinitePages([infiniteResp.tagWorks])
      setHasNextPage(infiniteResp.tagWorks.length === 32)
      // スクロール位置復元
      const savedScrollY = sessionStorage.getItem(`scroll-infinite-${stateKey}`)
      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo(0, Number.parseInt(savedScrollY, 10))
        }, 100)
      }
    }
  }, [
    infiniteResp,
    isPagination,
    cachedInitialPages,
    infinitePages.length,
    stateKey,
  ])

  // フィードモードでのスクロール位置保存
  useEffect(() => {
    if (isPagination) return

    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll-infinite-${stateKey}`,
        window.scrollY.toString(),
      )
    }

    const handleBeforeUnload = () => saveScrollPosition()
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      saveScrollPosition()
    }
  }, [isPagination, stateKey])

  // ソート条件やタグが変更された時にデータをリセット
  useEffect(() => {
    if (!isPagination) {
      setInfinitePages([])
      setHasNextPage(true)
      // スクロール位置をクリア
      sessionStorage.removeItem(`scroll-infinite-${stateKey}`)
    }
  }, [
    props.tag,
    props.orderBy,
    props.sort,
    props.hasPrompt,
    isPagination,
    stateKey,
  ])

  // 無限スクロールのロード処理
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || isPagination) return

    const flatWorks = infinitePages.flat()
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          offset: flatWorks.length,
          limit: 32,
          where: {
            tagNames: [props.tag],
            orderBy: props.orderBy,
            sort: props.sort,
            ratings: ["G", "R15"],
            hasPrompt: props.hasPrompt === 1 ? true : undefined,
            isPromptPublic: props.hasPrompt === 1 ? true : undefined,
            isNowCreatedAt: true,
          },
        },
      })

      if (result.data?.tagWorks) {
        const newWorks = result.data.tagWorks
        setInfinitePages((prev) => [...prev, newWorks])
        setHasNextPage(newWorks.length === 32)
      }
    } catch (error) {
      console.error("Failed to load more works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    isLoadingMore,
    hasNextPage,
    isPagination,
    infinitePages,
    fetchMore,
    props.tag,
    props.orderBy,
    props.sort,
    props.hasPrompt,
  ])

  // Intersection Observer の設定
  useEffect(() => {
    if (isPagination) return

    const currentRef = loadingRef.current
    if (!currentRef) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasNextPage && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    observerRef.current.observe(currentRef)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isPagination, hasNextPage, isLoadingMore, loadMore])

  // 表示する作品データの決定
  const displayedWorks = useMemo(() => {
    if (isPagination) {
      return paginationResp?.tagWorks ?? props.works
    }
    const flatWorks = infinitePages.flat()
    return flatWorks.length > 0
      ? flatWorks
      : cachedInitialPages.length > 0
        ? cachedInitialPages[0]
        : props.works
  }, [
    isPagination,
    paginationResp,
    props.works,
    infinitePages,
    cachedInitialPages,
  ])

  const firstWork = displayedWorks.length ? displayedWorks[0] : null

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  const isFollowedTag = followedTagsData?.viewer?.followingTags.some(
    (tag) => tag.name === props.tag,
  )

  const handleModeChange = (newMode: "pagination" | "feed") => {
    // 現在のスクロール位置を保存
    if (isPagination) {
      sessionStorage.setItem(
        `scroll-pagination-${stateKey}-${props.page}`,
        window.scrollY.toString(),
      )
    } else {
      sessionStorage.setItem(
        `scroll-infinite-${stateKey}`,
        window.scrollY.toString(),
      )
    }

    const newIsPagination = newMode === "pagination"
    setIsPagination(newIsPagination)

    // 親コンポーネントの状態を更新（URLパラメータもここで更新される）
    props.setMode(newMode)

    if (newIsPagination) {
      props.setPage(0)
    } else {
      setHasNextPage(true)
    }
  }

  // ローディング状態の判定
  const isLoading = isPagination
    ? paginationLoading && !paginationResp
    : infiniteLoading &&
      infinitePages.length === 0 &&
      cachedInitialPages.length === 0

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
            <div className="mt-auto font-bold text-md">
              <p>
                #{props.tag}
                {t("の作品", "")}
              </p>
              <p>
                {props.worksCount}
                {t("件", " posts")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <GoogleCustomSearch />

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
          <TagActionOther tag={props.tag} />
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

      {/* 表示モード切り替えボタン - 右寄せでフィード・ページネーションの順 */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <Button
            variant={!isPagination ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("feed")}
            className="flex items-center space-x-1"
          >
            <List className="h-4 w-4" />
            <span>{t("フィード", "Feed")}</span>
          </Button>
          <Button
            variant={isPagination ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("pagination")}
            className="flex items-center space-x-1"
          >
            <Grid className="h-4 w-4" />
            <span>{t("ページネーション", "Pagination")}</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span>{t("読み込み中...", "Loading...")}</span>
          </div>
        </div>
      ) : (
        <ResponsivePhotoWorksAlbum
          works={displayedWorks}
          isShowProfile={true}
        />
      )}

      {/* 無限スクロール用のローディング表示 */}
      {!isPagination && !isLoading && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span>{t("読み込み中...", "Loading...")}</span>
            </div>
          )}
          {!hasNextPage && infinitePages.flat().length > 0 && (
            <p className="text-muted-foreground">
              {t("すべての作品を表示しました", "All works have been displayed")}
            </p>
          )}
        </div>
      )}

      <div className="h-8" />

      {/* ページネーション用のコントロール */}
      {isPagination && (
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
          <ResponsivePagination
            maxCount={Number(props.worksCount)}
            perPage={32}
            currentPage={props.page}
            onPageChange={(page: number) => {
              // 現在のページのスクロール位置を保存
              sessionStorage.setItem(
                `scroll-pagination-${stateKey}-${props.page}`,
                window.scrollY.toString(),
              )
              props.setPage(page)
            }}
          />
        </div>
      )}
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
