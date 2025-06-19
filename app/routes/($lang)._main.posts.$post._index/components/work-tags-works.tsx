import { useQuery, useApolloClient } from "@apollo/client/index"
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { graphql, type FragmentOf } from "gql.tada"

import { AuthContext } from "~/contexts/auth-context"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Loader2Icon } from "lucide-react"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { useScrollRestoration } from "~/routes/($lang)._main._index/hooks/use-scroll-restoration"

/* -----------------------------------------------------------------
 * Constants & helpers
 * -----------------------------------------------------------------*/
const PER_PAGE = 32

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

/* -----------------------------------------------------------------
 * GraphQL
 * -----------------------------------------------------------------*/
const TagsWorkFragment = graphql(
  `fragment TagsWork on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const worksQuery = graphql(
  `query WorksByTag(
    $offset: Int!
    $limit: Int!
    $where: WorksWhereInput
  ) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...TagsWork
    }
  }`,
  [TagsWorkFragment],
)

/* -----------------------------------------------------------------
 * Props
 * -----------------------------------------------------------------*/
type Props = {
  tagName: string
  rating: "G" | "R15" | "R18" | "R18G"
}

/* -----------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------*/
export function WorkTagsWorks({ tagName, rating }: Props) {
  const auth = useContext(AuthContext)
  const _client = useApolloClient()
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  /* 共通 where 句 */
  const where = useMemo(
    () => ({
      tagNames: [tagName],
      ratings: [rating],
      isNowCreatedAt: true,
    }),
    [tagName, rating],
  )
  const baseVars = { offset: 0, limit: PER_PAGE, where }

  /* ---------- 初回取得 ---------- */
  const {
    data,
    loading: loadingFirst,
    fetchMore,
  } = useQuery(worksQuery, {
    skip: auth.isLoading,
    variables: baseVars,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  })

  /* ---------- ページストア ---------- */
  const initialPages = useMemo(() => {
    if (!data?.works?.length) return []
    return chunk(data.works, PER_PAGE)
  }, [data?.works])

  const { pages, appendPage, replaceFirstPage, flat } = usePagedInfinite<
    FragmentOf<typeof PhotoAlbumWorkFragment>
  >(initialPages, JSON.stringify({ tag: tagName, rate: rating }))

  /* ---------- 1ページ目差し替え（無限ループ防止） ---------- */
  const prevFirstLenRef = useRef<number | null>(null)
  useEffect(() => {
    if (!data?.works?.length) return
    const chunked = chunk(data.works, PER_PAGE)
    const first = chunked[0]

    // 既に同じ長さなら state 更新しない
    if (prevFirstLenRef.current === first.length) return

    replaceFirstPage(first)
    if (chunked.length > 1) appendPage(chunked[1])
    prevFirstLenRef.current = first.length
  }, [data?.works, replaceFirstPage, appendPage])

  /* ---------- スクロール復元 ---------- */
  const ready = initialPages.length > 0 || !!data?.works?.length
  useScrollRestoration(`tag-${tagName}-${rating}-infinite`, ready)

  /* ---------- 追加ロード ---------- */
  const hasNext = (pages.at(-1)?.length ?? 0) === PER_PAGE

  const loadMore = useCallback(async () => {
    if (!hasNext || loadingFirst || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetchMore({
        variables: { ...baseVars, offset: flat.length },
      })
      const newWorks = res.data?.works as
        | FragmentOf<typeof PhotoAlbumWorkFragment>[]
        | undefined
      if (newWorks?.length) appendPage(newWorks)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    hasNext,
    loadingFirst,
    isLoadingMore,
    fetchMore,
    baseVars,
    flat.length,
    appendPage,
  ])

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: loadingFirst,
  })

  /* ---------- UI ---------- */
  if (auth.isLoading) return <CenteredLoader />
  if (!loadingFirst && flat.length === 0) return <NoData />

  return (
    <div className="space-y-8">
      {/* ページ単位で DIV 分割 */}
      {pages.map((pageWorks, idx) => (
        <div key={idx.toString()}>
          <Suspense fallback={<CenteredLoader />}>
            <ResponsivePhotoWorksAlbum
              works={
                pageWorks as unknown as FragmentOf<
                  typeof PhotoAlbumWorkFragment
                >[]
              }
              isShowProfile
            />
          </Suspense>
        </div>
      ))}

      {hasNext && (
        <div ref={sentinelRef} style={{ height: 1 } as CSSProperties} />
      )}
      {(loadingFirst || isLoadingMore) && <CenteredLoader />}
    </div>
  )
}

/* -----------------------------------------------------------------
 * Helper components
 * -----------------------------------------------------------------*/
function CenteredLoader() {
  return (
    <div className="flex justify-center py-4">
      <Loader2Icon className="size-6 animate-spin text-border" />
    </div>
  )
}

function NoData() {
  return (
    <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
      No works found for this tag.
    </div>
  )
}
