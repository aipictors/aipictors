import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useCallback, useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"

const STORAGE_KEY = "follow_feed_last_seen_at"

/** 新着を確かめる間隔（タブを開いたままでも増えたら分かるように） */
const POLL_INTERVAL_MS = 5 * 60 * 1000

function readLastSeenAt(): number | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === null ? null : Number(value)
  } catch {
    return null
  }
}

function writeLastSeenAt(seconds: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(seconds))
  } catch {
    // 保存できなくても続ける
  }
}

const nowSeconds = () => Math.floor(Date.now() / 1000)

/**
 * フォロー新着を最後に見てから増えた作品の数
 * 初めての人は「今」を最後に見た時刻にする（いきなり 99+ を出さない）
 */
export function useFollowFeedNewCount() {
  const authContext = useContext(AuthContext)

  const viewerRatings = useViewerRatings()

  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null)

  useEffect(() => {
    const stored = readLastSeenAt()
    if (stored === null) {
      const now = nowSeconds()
      writeLastSeenAt(now)
      setLastSeenAt(now)
      return
    }
    setLastSeenAt(stored)
  }, [])

  const { data } = useQuery(followUserFeedNewWorksCountQuery, {
    skip:
      lastSeenAt === null ||
      authContext.isLoading ||
      authContext.isNotLoggedIn ||
      !viewerRatings.isReady,
    variables: {
      since: lastSeenAt ?? 0,
      ratings: viewerRatings.normalRatings,
    },
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  })

  /** フォロー新着を見た（数を消す） */
  const markAsSeen = useCallback(() => {
    const now = nowSeconds()
    writeLastSeenAt(now)
    setLastSeenAt(now)
  }, [])

  return {
    count: data?.followUserFeedNewWorksCount ?? 0,
    /** 前回見た時刻（この時刻より新しい作品に「NEW」を付ける） */
    lastSeenAt,
    markAsSeen,
  }
}

const followUserFeedNewWorksCountQuery = graphql(
  `query FollowUserFeedNewWorksCount($since: Int!, $ratings: [Rating!]) {
    followUserFeedNewWorksCount(since: $since, ratings: $ratings)
  }`,
)
