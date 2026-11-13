import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { PictorChanSays } from "~/components/pictor-chan-says"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

const PAGE_SIZE = 20

/**
 * 名前・ユーザー ID に言葉を含むユーザー（アプリの検索の「ユーザー」タブと同じ）
 */
export function SearchUsersPanel(props: {
  query: string
  isSensitiveMode: boolean
  pagePrefix: string
}) {
  const t = useTranslation()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { data, loading, error, fetchMore, refetch } = useQuery(
    searchUsersQuery,
    {
      variables: {
        offset: 0,
        limit: PAGE_SIZE,
        where: { search: props.query },
        ratings: props.isSensitiveMode ? ["R18"] : ["G", "R15"],
      },
      onCompleted: (result) => setHasMore(result.users.length >= PAGE_SIZE),
    },
  )

  const users = data?.users ?? []

  const loadMore = async () => {
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: { offset: users.length },
        updateQuery: (prev, { fetchMoreResult }) => {
          const known = new Set(prev.users.map((user) => user.id))
          return {
            users: [
              ...prev.users,
              ...fetchMoreResult.users.filter((user) => !known.has(user.id)),
            ],
          }
        },
      })
      setHasMore(result.data.users.length >= PAGE_SIZE)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center text-sm">
        <p>{t("ユーザーを読み込めませんでした", "Could not load users")}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("もう一度読み込む", "Retry")}
        </Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-6">
        <PictorChanSays>
          {t(
            `「${props.query}」のユーザーは見つかりませんでした。名前やユーザー ID の一部でも探せますよ！`,
            `No users found for "${props.query}". Part of the name or ID works too!`,
          )}
        </PictorChanSays>
      </div>
    )
  }

  return (
    <div>
      <ul className="divide-y">
        {users.map((user) => (
          <li key={user.id} className="flex flex-col gap-3 py-4">
            <div className="flex items-center gap-3">
              <Link
                to={`${props.pagePrefix}/users/${user.login}`}
                className="shrink-0"
              >
                <UserAvatarWithFrame
                  alt={user.name}
                  frame={user.avatarFrame}
                  isAnimated={false}
                  sizeClassName="size-12"
                  src={withIconUrlFallback(user.iconUrl)}
                />
              </Link>
              <Link
                to={`${props.pagePrefix}/users/${user.login}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-bold">{user.name}</p>
                <p className="truncate text-muted-foreground text-xs">
                  @{user.login}
                </p>
                {user.biography && (
                  <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
                    {user.biography}
                  </p>
                )}
              </Link>
              <FollowButton
                targetUserId={user.id}
                isFollow={user.isFollowee}
                isFollower={user.isFollower}
                targetUserName={user.name}
                className="w-auto shrink-0 px-4"
              />
            </div>
            {user.works && user.works.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 sm:max-w-md">
                {user.works.map((work) => (
                  <Link
                    key={work.id}
                    to={`${props.pagePrefix}/posts/${work.id}`}
                    className="block aspect-square overflow-hidden rounded-md bg-muted"
                  >
                    <img
                      src={toResizedImageUrl(work.smallThumbnailImageURL, 240)}
                      alt={t.workTitle(work.title, work.enTitle)}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="h-11 rounded-full px-8"
            disabled={isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore
              ? t("読み込み中…", "Loading…")
              : t("もっと見る", "Load more")}
          </Button>
        </div>
      )}
    </div>
  )
}

const searchUsersQuery = graphql(
  `query SearchPageUsers(
    $offset: Int!,
    $limit: Int!,
    $where: UsersWhereInput,
    $ratings: [Rating!]
  ) {
    users(offset: $offset, limit: $limit, where: $where) {
      id
      login
      name
      iconUrl
      biography
      isFollowee
      isFollower
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
      works(offset: 0, limit: 4, where: { ratings: $ratings }) {
        id
        title
        enTitle
        smallThumbnailImageURL
      }
    }
  }`,
)
