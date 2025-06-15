import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState, useContext } from "react"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { MessageCircleIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { cn } from "~/lib/utils"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"

interface Props {
  feedType: "FOLLOW_USER" | "FOLLOW_TAG"
  userId: string
  page?: number
  setPage?: (page: number) => void
}

export function TimelineView({ feedType, userId, page = 0, setPage }: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [hiddenComments, setHiddenComments] = useState<{
    [key: string]: boolean
  }>({})
  const [subWorksVisible, setSubWorksVisible] = useState<{
    [key: string]: boolean
  }>({})

  const limit = 20
  const offset = limit * page

  const { data } = useSuspenseQuery(timelineFeedQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: offset,
      limit: limit,
      feedWhere: {
        userId: userId,
        type: feedType,
      },
      feedPostsWhere: {
        ratings: ["G", "R15"],
      },
    },
  })

  if (!data?.feed || !data.feed.posts || data.feed.posts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-center">
          {feedType === "FOLLOW_USER"
            ? t(
                "まだデータがありません、ユーザをフォローして最新の作品をキャッチアップしましょう！",
                "No data yet, follow users to catch up on the latest works!",
              )
            : t(
                "まだデータがありません、タグをフォローして最新の作品をキャッチアップしましょう！",
                "No data yet, follow tags to catch up on the latest works!",
              )}
        </p>
      </div>
    )
  }

  const posts = data.feed.posts
  const works = posts
    .filter((post) => post?.work)
    .map((post) => post.work)
    .filter((work) => work !== null)

  const toggleCommentsVisibility = (postId: string) => {
    setHiddenComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }))
  }

  const toggleSubWorksVisibility = (postId: string) => {
    setSubWorksVisible((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }))
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="m-auto w-full space-y-4">
        {works.map(
          (work) =>
            work && (
              <Card key={work.id} className="rounded-lg border">
                <CardHeader className="m-auto flex max-w-[1200px] justify-start">
                  {work.user && (
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage
                          className="rounded-full"
                          src={withIconUrlFallback(work.user.iconUrl)}
                          alt=""
                        />
                        <AvatarFallback />
                      </Avatar>
                      <Link
                        to={`/users/${work.user.login}`}
                        className="flex items-center space-x-2"
                      >
                        <div className="font-semibold text-md">
                          {work.user.name}
                        </div>
                        <div className="text-sm">@{work.user.login}</div>
                      </Link>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="m-auto max-w-[1200px]">
                  <div className="w-full md:flex md:space-x-8">
                    <div className="space-y-2 md:w-1/2 md:max-w-[560px]">
                      <div className="relative">
                        <Link to={`/posts/${work.id}`}>
                          <img
                            src={work.largeThumbnailImageURL}
                            alt={work.title}
                            className="w-full rounded-md"
                          />
                        </Link>
                        {work.subWorks.length > 0 && (
                          <>
                            {!subWorksVisible[work.id] && (
                              <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-88" />
                            )}
                            <Button
                              className="-translate-x-1/2 absolute bottom-2 left-1/2 transform rounded-full opacity-80"
                              variant="secondary"
                              onClick={() => toggleSubWorksVisibility(work.id)}
                            >
                              {!subWorksVisible[work.id]
                                ? t(
                                    `もっと見る(${work.subWorks.length})`,
                                    `Show More (${work.subWorks.length})`,
                                  )
                                : t("閉じる", "Close")}
                            </Button>
                            {subWorksVisible[work.id] &&
                              work.subWorks.map(
                                (subWork, index) =>
                                  subWork.imageUrl && (
                                    <Link
                                      key={index.toString()}
                                      to={`/posts/${work.id}`}
                                    >
                                      <img
                                        src={subWork.imageUrl}
                                        alt={work.title}
                                        className="w-full rounded-md"
                                      />
                                    </Link>
                                  ),
                              )}
                          </>
                        )}
                      </div>
                      <div className="font-semibold text-md">{work.title}</div>
                      {work.description && (
                        <div className="text-muted-foreground text-sm">
                          {work.description}
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <LikeButton
                            size={40}
                            text={t("いいね", "Like")}
                            targetWorkId={work.id}
                            targetWorkOwnerUserId={work.user?.id ?? ""}
                            defaultLiked={work.isLiked}
                            defaultLikedCount={work.likesCount}
                            isBackgroundNone={false}
                            strokeWidth={2}
                          />
                        </div>
                        {work.isCommentsEditable && (
                          <Button
                            variant="secondary"
                            className="flex cursor-pointer items-center space-x-1"
                            onClick={() => {
                              toggleCommentsVisibility(work.id)
                            }}
                          >
                            <MessageCircleIcon className="size-5" />
                            <p>{work.commentsCount}</p>
                          </Button>
                        )}
                      </div>
                      {work.tagNames.length > 0 && (
                        <div className="flex flex-wrap gap-x-4">
                          {work.tagNames.map((tagName) => (
                            <Link
                              to={`/tags/${tagName}`}
                              key={tagName}
                              className="p-0"
                            >
                              <Button className="p-0" variant="link">
                                {`#${tagName}`}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                      <div className="text-muted-foreground text-sm">
                        {toDateTimeText(work.createdAt)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        hiddenComments[work.id] ? "block" : "hidden",
                        "md:block",
                        "w-full overflow-y-auto",
                      )}
                    >
                      {work.isCommentsEditable && work.comments && (
                        <WorkCommentList
                          workId={work.id}
                          comments={work.comments}
                          defaultShowCommentCount={3}
                          workOwnerIconImageURL={work.user?.iconUrl}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
        )}
      </div>

      {/* ページネーション */}
      {setPage && <div className="h-8" />}
      {setPage && (
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
          {posts.length > 0 && (
            <div className="m-auto flex items-center justify-center space-x-2">
              {page > 0 ? (
                <Button onClick={() => setPage(page - 1)}>
                  {t("前へ", "Previous")}
                </Button>
              ) : (
                <div />
              )}
              {posts.length === limit ? (
                <Button onClick={() => setPage(page + 1)}>
                  {t("次へ", "Next")}
                </Button>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// GraphQL Fragment for work fields used in timeline
export const TimelineWorkFieldsFragment = graphql(
  `fragment TimelineWorkFields on WorkNode @_unmask {
    id
    title
    largeThumbnailImageURL
    description
    tagNames
    isLiked
    likesCount
    createdAt
    commentsCount  
    isCommentsEditable
    user {
      id
      name
      login
      iconUrl
    }
    subWorks {
      imageUrl
    }
  }`,
)

// Timeline feed query
const timelineFeedQuery = graphql(
  `query TimelineFeed($limit: Int!, $offset: Int!, $feedWhere: FeedWhereInput!, $feedPostsWhere: FeedPostsWhereInput) {
    feed(where: $feedWhere) {
      posts(limit: $limit, offset: $offset, where: $feedPostsWhere) {
        id
        work {
          ...TimelineWorkFields
          comments(offset: 0, limit: 128) {
            ...Comment
          }
        }
      }
    }
  }`,
  [CommentListItemFragment, TimelineWorkFieldsFragment],
)
