import { useQuery } from "@apollo/client/index"
import {
  useCallback,
  useContext,
  useMemo,
  useState,
  Suspense,
  type CSSProperties,
} from "react"
import { graphql, type FragmentOf } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import {
  ResponsivePhotoWorksAlbum,
  PhotoAlbumWorkFragment,
} from "~/components/responsive-photo-works-album"
import { Loader2Icon } from "lucide-react"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"

const PER_PAGE = 32

/* ─── GraphQL ────────────────────────────────────────────────── */
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
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...TagsWork
    }
  }`,
  [TagsWorkFragment],
)

/* ─── Component ─────────────────────────────────────────────── */
type Props = {
  tagName: string
  rating: "G" | "R15" | "R18" | "R18G"
}

export function WorkTagsWorks({ tagName, rating }: Props) {
  const auth = useContext(AuthContext)
  const [pages, setPages] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[][]
  >([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  /* where 句は useMemo で固定 */
  const where = useMemo(
    () => ({
      tagNames: [tagName],
      ratings: [rating],
      isNowCreatedAt: true,
    }),
    [tagName, rating],
  )

  /* 初回取得 */
  const { data, loading, fetchMore } = useQuery(worksQuery, {
    skip: auth.isLoading,
    variables: { offset: 0, limit: PER_PAGE, where },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    onCompleted(res) {
      setPages([res.tagWorks]) // 1 ページ目を保存
    },
  })

  /* hasNext 判定 */
  const lastPage = pages.at(-1) ?? []
  const hasNext = lastPage.length >= PER_PAGE - 8

  /* 追加ロード */
  const loadMore = useCallback(async () => {
    if (loading || isLoadingMore || !hasNext) return
    setIsLoadingMore(true)
    try {
      const res = await fetchMore({
        variables: { offset: pages.flat().length, limit: PER_PAGE, where },
      })
      if (res.data?.tagWorks?.length) {
        setPages((prev) => [...prev, res.data.tagWorks])
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [loading, isLoadingMore, hasNext, fetchMore, pages, where])

  /* IntersectionObserver */
  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading,
  })

  /* UI */
  if (auth.isLoading || loading) return <CenteredLoader />
  if (!pages.flat().length) return <NoData />

  return (
    <div className="space-y-8">
      {pages.map((works, idx) => (
        <div key={idx.toString()}>
          <Suspense fallback={<CenteredLoader />}>
            <ResponsivePhotoWorksAlbum
              works={
                works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]
              }
              isShowProfile
            />
          </Suspense>
        </div>
      ))}

      {hasNext && (
        <div ref={sentinelRef} style={{ height: 1 } as CSSProperties} />
      )}
      {isLoadingMore && <CenteredLoader />}
    </div>
  )
}

/* ─── Sub-components ────────────────────────────────────────── */
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
      <p>該当する作品がありません</p>
    </div>
  )
}
