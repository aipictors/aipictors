import { useSuspenseQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { Suspense, useContext, useState } from "react"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { MessageCircleIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { cn } from "~/lib/cn"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { ResponsivePagination } from "~/components/responsive-pagination"

type Props = {
  isSensitive?: boolean
  page: number
  setPage: (page: number) => void
}

export function FollowUserFeedContents(props: Props) {
  const authContext = useContext(AuthContext)
  const [isTimelineView, setIsTimelineView] = useState(false)
  const [hiddenComments, setHiddenComments] = useState<{
    [key: string]: boolean
  }>({})
  const [subWorksVisible, setSubWorksVisible] = useState<{
    [key: string]: boolean
  }>({})

  // クエリを状態に応じて切り替える
  const { data } = useSuspenseQuery(
    isTimelineView ? feedQuery : feedWorkListQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        offset: 96 * props.page,
        limit: 96,
        feedWhere: {
          userId: authContext.userId ?? "-1",
          type: "FOLLOW_USER",
        },
        feedPostsWhere: {
          ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
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
          {
            "ログインすることでユーザやタグをフォローして、タイムラインで作品を楽しむことができます"
          }
        </p>
      </div>
    )
  }

  if (!data?.feed || !data.feed.posts || data.feed.posts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-center">
          {
            "まだデータがありません、ユーザやタグをフォローして最新の作品をキャッチアップしましょう！"
          }
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

  // works の取得方法を変更
  const works = posts
    .filter((post) => post?.work)
    .map((post) => post.work)
    .map((work) => work)

  return (
    <div className="flex flex-col space-y-4">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsTimelineView(!isTimelineView)}>
          {isTimelineView ? "一覧形式に切り替え" : "タイムライン形式に切り替え"}
        </Button>
      </div>
      {isTimelineView ? (
        <div className="m-auto w-full space-y-4">
          {works.map(
            (work) =>
              work && (
                <Card key={work.id} className="rounded-lg border">
                  <CardHeader className="m-auto flex max-w-[1200px] justify-start">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage
                          className="rounded-full"
                          src={ExchangeIconUrl(work.user.iconUrl)}
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
                                    ? `もっと見る(${work.subWorks.length})`
                                    : "閉じる"}
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
                                text={"いいね"}
                                targetWorkId={work.id}
                                targetWorkOwnerUserId={work.user.id}
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
      <ResponsivePagination
        perPage={96}
        maxCount={96}
        currentPage={props.page}
        onPageChange={(page: number) => {
          props.setPage(page)
        }}
      />
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