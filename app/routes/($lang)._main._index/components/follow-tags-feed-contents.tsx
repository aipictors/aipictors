import { useSuspenseQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { Suspense, useContext, useState } from "react"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { MessageCircleIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { LikeButton } from "~/components/like-button"
import { Link, useNavigate, useSearchParams } from "@remix-run/react"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { cn } from "~/lib/utils"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  page: number
  setPage: (page: number) => void
}

export function FollowTagsFeedContents(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const [isTimelineView, setIsTimelineView] = useState(false)

  const [hiddenComments, setHiddenComments] = useState<{
    [key: string]: boolean
  }>({})

  const [subWorksVisible, setSubWorksVisible] = useState<{
    [key: string]: boolean
  }>({})

  const limit = 96

  const offset = limit * props.page

  const { data } = useSuspenseQuery(
    isTimelineView ? feedQuery : feedWorkListQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        offset: offset,
        limit: limit,
        feedWhere: {
          userId: authContext.userId ?? "-1",
          type: "FOLLOW_TAG",
        },
        feedPostsWhere: {
          ratings: ["G", "R15"],
        },
      },
    },
  )

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  if (
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-center">
          {t(
            "ログインすることでユーザやタグをフォローして、タイムラインで作品を楽しむことができます",
            "You can follow users and tags to enjoy the timeline by logging in.",
          )}
        </p>
      </div>
    )
  }

  if (!data?.feed || !data.feed.posts || data.feed.posts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-center">
          {t(
            "まだデータがありません、ユーザやタグをフォローして最新の作品をキャッチアップしましょう！",
            "No data available yet, follow users or tags to catch up on the latest works!",
          )}
        </p>
      </div>
    )
  }

  const posts = data.feed.posts

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

  const works = posts
    .filter((post) => post?.work)
    .map((post) => post.work)
    .map((work) => work)

  return (
    <div className="flex flex-col space-y-4">
      <div className="mb-4 flex justify-end space-x-2">
        <Button
          onClick={() => {
            navigate("/settings/followed/tags")
          }}
          variant={"secondary"}
        >
          {t("管理", "Manage")}
        </Button>
        <Button onClick={() => setIsTimelineView(!isTimelineView)}>
          {isTimelineView
            ? t("一覧形式に切り替え", "Switch to List View")
            : t("タイムライン形式に切り替え", "Switch to Timeline View")}
        </Button>
      </div>
      {isTimelineView ? (
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
                    <Suspense fallback={<AppLoadingPage />}>
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
                                  variant={"secondary"}
                                  onClick={() =>
                                    toggleSubWorksVisibility(work.id)
                                  }
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
                          <div className="font-semibold text-md">
                            {work.title}
                          </div>
                          <div>{work.description}</div>
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
                            {work !== null && (
                              <Button
                                variant={"secondary"}
                                className="flex cursor-pointer items-center space-x-1"
                                onClick={() => {
                                  if (work) {
                                    toggleCommentsVisibility(work.id)
                                  }
                                }}
                              >
                                <MessageCircleIcon className="h-5 w-5" />
                                <p>{work.commentsCount}</p>
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4">
                            {work.tagNames.map((tagName) => (
                              <Link
                                to={`/tags/${tagName}`}
                                key={tagName}
                                className="p-0"
                              >
                                <Button className="p-0" variant={"link"}>
                                  {`#${tagName}`}
                                </Button>
                              </Link>
                            ))}
                          </div>
                          <div className="text-sm">
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
                          {work.isCommentsEditable && (
                            <WorkCommentList
                              workId={work.id}
                              comments={work.comments}
                              defaultShowCommentCount={3}
                              workOwnerIconImageURL={work.user?.iconUrl}
                            />
                          )}
                        </div>
                      </div>
                    </Suspense>
                  </CardContent>
                </Card>
              ),
          )}
        </div>
      ) : (
        <div className="m-auto w-full space-y-4">
          <ResponsivePhotoWorksAlbum
            works={
              works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]
            }
            isShowProfile={true}
          />
        </div>
      )}
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {posts.length > 0 && (
          <div className="m-auto flex items-center justify-center space-x-2">
            {props.page > 0 ? (
              <Button onClick={() => props.setPage(props.page - 1)}>
                {t("前へ", "Previous")}
              </Button>
            ) : (
              <div />
            )}
            {posts.length === limit ? (
              <Button onClick={() => props.setPage(props.page + 1)}>
                {t("次へ", "Next")}
              </Button>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const workFieldsFragment = graphql(
  `fragment PartialWorkFields on WorkNode @_unmask {
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

const feedQuery = graphql(
  `query Feed($limit: Int!, $offset: Int!, $feedWhere: FeedWhereInput!, $feedPostsWhere: FeedPostsWhereInput) {
    feed(where: $feedWhere) {
      posts(limit: $limit, offset: $offset, where: $feedPostsWhere) {
        id
        work {
          ...PartialWorkFields
          comments(offset: 0, limit: 128) {
            ...Comment
          }
        }
      }
    }
  }`,
  [CommentListItemFragment, workFieldsFragment],
)

const feedWorkListQuery = graphql(
  `query FeedWorkList($limit: Int!, $offset: Int!, $feedWhere: FeedWhereInput!, $feedPostsWhere: FeedPostsWhereInput) {
    feed(where: $feedWhere) {
      posts(limit: $limit, offset: $offset, where: $feedPostsWhere) {
        id
        work {
          ...PhotoAlbumWork
        }
      }
    }
  }`,
  [PhotoAlbumWorkFragment],
)
