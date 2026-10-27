import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { Suspense, useCallback, useContext, useMemo, useState } from "react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

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
  const t = useTranslation()
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
      // 1 ページ目を保存。追加読み込み（fetchMore）のあとにも呼ばれることがあり、
      // そのたびに 1 ページ目だけに戻すと一覧が縮んでページが大きくずれるので、未保存のときだけ入れる
      setPages((prev) => (prev.length > 0 ? prev : [res.tagWorks]))
    },
  })

  // タグが変わったら最初から（前のタグの一覧は使わない）
  const whereKey = `${tagName}\n${rating}`
  const [pagesKey, setPagesKey] = useState(whereKey)
  if (pagesKey !== whereKey) {
    setPagesKey(whereKey)
    setPages([])
  }

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

  /* UI */
  // 読み込み中の表示は、まだ何も出していないときだけ（出したあとに一覧ごと消すと画面がずれる）
  // 一覧が届くまで 1 画面分の場所を取っておく（届いたときにフッターが押し下げられてページがずれないように）
  if (pages.length === 0 && (auth.isLoading || loading))
    return (
      <div className="min-h-[100vh]">
        <CenteredLoader />
      </div>
    )
  if (pages.length === 0 && data?.tagWorks?.length) {
    // onCompleted より先に描画されたとき
    setPages([data.tagWorks])
    return <div className="min-h-[100vh]" />
  }
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

      {/*
        自動で続きを読み込むと、末尾のフッター（スマホで約 1,000px）が見えている状態で一覧が伸び、
        画面全体が大きくずれる（実ユーザーの CLS が 0.5 を超えていた主因）。ボタンで読み込む
      */}
      {hasNext && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            className="w-full max-w-sm"
            disabled={isLoadingMore}
            onClick={() => {
              loadMore()
            }}
          >
            {isLoadingMore ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              t("もっと見る", "See more")
            )}
          </Button>
        </div>
      )}
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
