import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import type { UserModelRating } from "~/lib/user-models/types"

type Props = {
  modelId: string
  modelRating: UserModelRating
}

const PER_PAGE = 24

/**
 * 一覧に出す年齢区分。全年齢・R-15 のモデルは全年齢・R-15 の作品だけ、
 * R-18 のモデルは R-18 の作品も出す（サムネイルはぼかす）
 */
export const toUserModelWorksRatings = (
  modelRating: UserModelRating,
): ("G" | "R15" | "R18" | "R18G")[] =>
  modelRating === "R18" || modelRating === "R18G"
    ? ["G", "R15", "R18", "R18G"]
    : ["G", "R15"]

/**
 * このモデルを使って投稿された作品（プロンプトを公開している作品だけ。API が作品のプロンプトから見つける）
 */
export function UserModelWorksSection(props: Props) {
  const ratings = toUserModelWorksRatings(props.modelRating)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [isEnd, setIsEnd] = useState(false)

  const { data, loading, fetchMore } = useQuery(userModelWorksQuery, {
    ssr: false,
    variables: {
      offset: 0,
      limit: PER_PAGE,
      where: { userModelId: props.modelId, ratings },
    },
  })

  const works = data?.works ?? []
  const count = data?.worksCount ?? 0

  if (loading && works.length === 0) {
    return null
  }

  if (works.length === 0) {
    return null
  }

  const onMore = async () => {
    setIsFetchingMore(true)
    try {
      const result = await fetchMore({
        variables: { offset: works.length },
        updateQuery: (prev, { fetchMoreResult }) => ({
          ...prev,
          works: [
            ...prev.works,
            ...fetchMoreResult.works.filter(
              (work) => !prev.works.some((item) => item.id === work.id),
            ),
          ],
        }),
      })
      if (result.data.works.length < PER_PAGE) {
        setIsEnd(true)
      }
    } finally {
      setIsFetchingMore(false)
    }
  }

  return (
    <section aria-labelledby="model-works-heading" className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 id="model-works-heading" className="font-bold text-lg">
          このモデルを使った作品
          <span className="ml-2 font-normal text-muted-foreground text-sm">
            {count}件
          </span>
        </h2>
      </div>
      <ResponsivePhotoWorksAlbum
        works={works}
        isShowProfile
        shouldMaskSensitiveWorks
      />
      {!isEnd && works.length < count && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            disabled={isFetchingMore}
            onClick={() => void onMore()}
          >
            {isFetchingMore && <Loader2Icon className="size-4 animate-spin" />}
            もっと見る
          </Button>
        </div>
      )}
      <p className="mt-3 text-muted-foreground text-xs">
        プロンプトを公開している作品から、このモデルを使ったものを表示しています。
      </p>
    </section>
  )
}

const userModelWorksQuery = graphql(
  `query UserModelWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
    worksCount(where: $where)
  }`,
  [PhotoAlbumWorkFragment],
)
