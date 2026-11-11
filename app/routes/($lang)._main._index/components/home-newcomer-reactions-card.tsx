import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Heart, MessageCircle, X } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { trackGrowthEvent } from "~/utils/track-growth-event"

/** 初投稿から何日まで出すか */
const NEWCOMER_DAYS = 14
/** 閉じたあと、反応がこの数だけ増えたらまた出す */
const REOPEN_AFTER = 5

const storageKey = (workId: string) =>
  `aipictors:newcomer-reactions:${workId}`

type Work = {
  id: string
  title: string
  smallThumbnailImageURL: string
  isFirstPost: boolean
  likesCount: number
  commentsCount: number
  createdAt: number
}

/**
 * 新人（初投稿から 14 日）の人に、作品に届いた反応（いいね・コメント）をホームの上で知らせる
 */
export function summarizeNewcomerReactions(works: Work[], nowSeconds: number) {
  const since = nowSeconds - NEWCOMER_DAYS * 24 * 60 * 60
  const firstPost = works.find((work) => work.isFirstPost)
  if (firstPost === undefined || firstPost.createdAt < since) return null
  const recent = works.filter((work) => work.createdAt >= since)
  const likes = recent.reduce((sum, work) => sum + work.likesCount, 0)
  const comments = recent.reduce((sum, work) => sum + work.commentsCount, 0)
  return {
    firstPost,
    likes,
    comments,
    otherWorksCount: recent.length - 1,
    total: likes + comments,
  }
}

export function HomeNewcomerReactionsCard() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data } = useQuery(homeNewcomerReactionsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-and-network",
  })

  const [dismissedTotal, setDismissedTotal] = useState<number | null>(null)
  const [isLoadedStorage, setIsLoadedStorage] = useState(false)

  const summary = summarizeNewcomerReactions(
    (data?.viewer?.works ?? []) as Work[],
    Math.floor(Date.now() / 1000),
  )

  const firstPostId = summary?.firstPost.id ?? null

  useEffect(() => {
    if (firstPostId === null) return
    try {
      const value = window.localStorage.getItem(storageKey(firstPostId))
      setDismissedTotal(value === null ? null : Number(value))
    } catch {
      setDismissedTotal(null)
    }
    setIsLoadedStorage(true)
  }, [firstPostId])

  const isVisible =
    summary !== null &&
    isLoadedStorage &&
    summary.total > 0 &&
    (dismissedTotal === null || summary.total >= dismissedTotal + REOPEN_AFTER)

  useEffect(() => {
    if (isVisible) trackGrowthEvent("newcomer_reactions_view", "home")
  }, [isVisible])

  if (!isVisible || summary === null) return null

  const onDismiss = () => {
    try {
      window.localStorage.setItem(
        storageKey(summary.firstPost.id),
        String(summary.total),
      )
    } catch {}
    setDismissedTotal(summary.total)
  }

  return (
    <div className="relative flex items-center gap-3 rounded-lg border border-pink-300 bg-pink-50 p-3 pr-10 dark:border-pink-900 dark:bg-pink-950/40">
      <Link to={`/posts/${summary.firstPost.id}`} className="shrink-0">
        <img
          src={summary.firstPost.smallThumbnailImageURL}
          alt={summary.firstPost.title}
          className="size-14 rounded-md object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-bold text-sm">
          {t(
            "🎉 あなたの作品に反応が届いています",
            "🎉 Your works are getting reactions",
          )}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 text-sm">
          <span className="flex items-center gap-1">
            <Heart className="size-4 fill-pink-500 text-pink-500" />
            {t(`いいね ${summary.likes}`, `${summary.likes} likes`)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-4 text-sky-500" />
            {t(
              `コメント ${summary.comments}`,
              `${summary.comments} comments`,
            )}
          </span>
          {summary.otherWorksCount > 0 && (
            <span className="text-xs opacity-70">
              {t(
                `初投稿とこの${NEWCOMER_DAYS}日の作品${summary.otherWorksCount}件の合計`,
                `Your first post and ${summary.otherWorksCount} recent works`,
              )}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/posts/${summary.firstPost.id}`}
            onClick={() => trackGrowthEvent("newcomer_reactions_click", "work")}
          >
            <Button size="sm" variant="secondary">
              {t("初投稿を見る", "View first post")}
            </Button>
          </Link>
          <Link
            to="/notifications"
            onClick={() =>
              trackGrowthEvent("newcomer_reactions_click", "notifications")
            }
          >
            <Button size="sm" variant="secondary">
              {t("お知らせを見る", "Notifications")}
            </Button>
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("閉じる", "Close")}
        className="absolute top-2 right-2 rounded-full p-1 opacity-60 hover:bg-muted hover:opacity-100"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

const homeNewcomerReactionsQuery = graphql(
  `query HomeNewcomerReactions {
    viewer {
      id
      works(offset: 0, limit: 20) {
        id
        title
        smallThumbnailImageURL
        isFirstPost
        likesCount
        commentsCount
        createdAt
      }
    }
  }`,
)
