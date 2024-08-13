import { useSuspenseQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { IconUrl } from "~/components/icon-url"
import { MessageCircleIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"

type Props = {
  isSensitive?: boolean
  page: number
  setPage: (page: number) => void
}

type PostSummaryType = FragmentOf<typeof PostSummaryFragment> & {
  feed: {
    posts: Array<{
      createdAt: string
      work: {
        id: string
        title: string
        largeThumbnailImageURL: string
        description: string
        tagNames: string[]
        isLiked: boolean
        likesCount: number
        commentsCount: number
        user: {
          id: string
          name: string
          login: string
          iconUrl: string
        }
      }
    }>
  }
}

export const FeedContents = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
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

  const data = useSuspenseQuery(feedQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 32 * props.page,
      limit: 32,
      userId: authContext.userId,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
      },
    },
  })

  if (
    !data?.data?.feed ||
    !data.data.feed.posts ||
    data.data.feed.posts.length === 0
  ) {
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

  const onMoreClick = () => {
    props.setPage(props.page + 1)
  }

  const posts = data.data.feed
    .posts as unknown as PostSummaryType["feed"]["posts"]

  return (
    <div className="m-auto w-full space-y-4 md:w-96">
      {posts.map(
        (post) =>
          post.work && (
            <Card key={post.work.id} className="rounded-lg border">
              <CardHeader className="m-0 flex justify-start">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      className="rounded-full"
                      src={IconUrl(post.work.user.iconUrl)}
                      alt=""
                    />
                    <AvatarFallback />
                  </Avatar>
                  <Link
                    to={`/users/${post.work.user.login}`}
                    className="flex items-center space-x-2"
                  >
                    <div className="font-semibold text-md">
                      {post.work.user.name}
                    </div>
                    <div className="text-sm">@{post.work.user.login}</div>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="m-0">
                <div className="space-y-2">
                  <Link to={`/posts/${post.work.id}`}>
                    <img
                      src={post.work.largeThumbnailImageURL}
                      alt={post.work.title}
                      className="w-full rounded-md"
                    />
                  </Link>
                  <div className="font-semibold text-md">{post.work.title}</div>
                  <div>{post.work.description}</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <LikeButton
                        size={40}
                        text={"いいね"}
                        targetWorkId={post.work.id}
                        targetWorkOwnerUserId={post.work.user.id}
                        defaultLiked={post.work.isLiked}
                        defaultLikedCount={post.work.likesCount}
                        isBackgroundNone={false}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircleIcon className="h-5 w-5" />
                      <p>{post.work.commentsCount}</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    {post.work.tagNames.map((tagName) => (
                      <Link
                        to={`/tags/${tagName}`}
                        key={tagName}
                        className="p-0"
                      >
                        <Button
                          className="p-0"
                          variant={"link"}
                        >{`#${tagName}`}</Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
      )}
      {/* <Button onClick={onMoreClick}>{"もっと見る"}</Button> */}
    </div>
  )
}

export const PostSummaryFragment = graphql(`
  fragment PostSummary on FeedPostNode {
    id
    work {
      id
      title
      largeThumbnailImageURL
      description
      tagNames
      isLiked
      likesCount
      commentsCount
      user {
        id
        name
        login
        iconUrl
      }
    }
    createdAt
  }
`)

const feedQuery = graphql(
  `query Feed($userId: ID!, $limit: Int!, $offset: Int!, $where: FeedPostsWhereInput) {
    feed(userId: $userId) {
      posts(limit: $limit, offset: $offset, where: $where) {
        ...PostSummary
      }
    }
  }`,
  [PostSummaryFragment],
)
