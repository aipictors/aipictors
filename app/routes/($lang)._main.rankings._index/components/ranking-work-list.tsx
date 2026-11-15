import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { useEffect, useRef, useState } from "react"
import {
  RankingList,
  RankingPodium,
} from "~/components/ranking/ranking-awards-view"

type Props = {
  awards: FragmentOf<typeof WorkAwardListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

/**
 * 作品ランキング（アプリのランキング画面と同じく、1〜3 位は冠つきの表彰台、4 位以下は番号つき）
 */
export function RankingWorkList(props: Props) {
  const workAwards = props.awards

  // 200 件を一度に描くと、スマホでは HTML が 1.8MB・要素 8,000 個を超えて表示が重かった。
  // 最初は上位だけ描き、一覧の終わりが近づいたら続きを描く
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const standardAwards = workAwards.slice(3, 3 + visibleCount)
  const hasMore = workAwards.length > 3 + visibleCount

  useEffect(() => {
    if (!hasMore) return
    const target = sentinelRef.current
    if (!target || !("IntersectionObserver" in window)) {
      setVisibleCount(workAwards.length)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => count + LOAD_MORE_COUNT)
        }
      },
      { rootMargin: "800px 0px" },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, workAwards.length, visibleCount])

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-8 md:space-y-6">
      <RankingPodium items={workAwards} />
      <RankingList items={standardAwards} startRank={4} />
      {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden />}
    </div>
  )
}

/** 最初に描く件数（上位 3 件のあと） */
const INITIAL_VISIBLE_COUNT = 20

/** 続きを描くときに増やす件数 */
const LOAD_MORE_COUNT = 40

export const WorkAwardListItemFragment = graphql(
  `fragment WorkAwardListItem on WorkAwardNode @_unmask {
      id
      index
      dateText
      snapshotLikedCount
      work {
        id
        title
        enTitle
        accessType
        adminAccessType
        type
        likesCount
        commentsCount
        bookmarksCount
        viewsCount
        createdAt
        rating
        smallThumbnailImageURL
        smallThumbnailImageHeight
        smallThumbnailImageWidth
        largeThumbnailImageURL
        largeThumbnailImageHeight
        largeThumbnailImageWidth
        type
        isLiked
        thumbnailImagePosition
        url
        subWorksCount
        user {
          id
          name
          iconUrl
        }
      }
  }`,
)
