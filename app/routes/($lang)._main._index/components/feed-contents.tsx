import { useSuspenseQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useState } from "react"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { IconUrl } from "~/components/icon-url"
import { Heart, MessageCircleIcon } from "lucide-react"
import { Button } from "~/components/ui/button"

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
        smallThumbnailImageURL: string
        description: string
        tagNames: string[]
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

  const [loadedPosts, setLoadedPosts] = useState<
    PostSummaryType["feed"]["posts"]
  >([])

  const { data } = useSuspenseQuery(feedQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 32 * props.page,
      limit: 32,
      userId: authContext.userId,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
      },
    },
    onCompleted: (data: PostSummaryType) => {
      if (data?.feed?.posts) {
        setLoadedPosts((prevPosts) => [...prevPosts, ...data.feed.posts])
      }
    },
  })

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

  const onMoreClick = () => {
    props.setPage(props.page + 1)
  }

  console.log(data.feed)

  return (
    <div className="space-y-4">
      {loadedPosts.map(
        (post) =>
          post.work && (
            <Card key={post.work.id} className="rounded-lg border">
              <CardHeader className="flex items-center space-x-3 p-4">
                <Avatar>
                  <AvatarImage
                    className="w-12 rounded-full"
                    src={IconUrl(post.work.user.iconUrl)}
                    alt=""
                  />
                  <AvatarFallback />
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">
                    {post.work.user.name}
                  </div>
                  <div className="text-sm">@{post.work.user.login}</div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <img
                    src={post.work.smallThumbnailImageURL}
                    alt={post.work.title}
                    className="w-full rounded-lg"
                  />
                  <div className="font-semibold text-lg">{post.work.title}</div>
                  <div>{post.work.description}</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5" />
                      {post.work.likesCount}
                    </div>
                    <div className="flex items-center">
                      <MessageCircleIcon className="h-5 w-5" />
                      {post.work.commentsCount}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {post.work.tagNames.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-1 text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ),
      )}
      <Button onClick={onMoreClick}>{"もっと見る"}</Button>
    </div>
  )
}

export const PostSummaryFragment = graphql(`
  fragment PostSummary on FeedPostNode {
    id
    work {
      id
      title
      smallThumbnailImageURL
      description
      tagNames
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
