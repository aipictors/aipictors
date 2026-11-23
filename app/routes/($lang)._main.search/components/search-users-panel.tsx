import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"
import { useState } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { PictorChanSays } from "~/components/pictor-chan-says"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

const PAGE_SIZE = 20

type UserSearchOrderBy =
  | "RELEVANCE"
  | "WORKS_COUNT"
  | "AWARDS_COUNT"
  | "LIKES_COUNT"
  | "COMMENTS_COUNT"
  | "VIEWS_COUNT"
  | "LOGGED_IN_DAYS"
  | "FOLLOWERS_COUNT"
  | "ACTIVITY_PERIOD"

const ORDER_OPTIONS: { value: UserSearchOrderBy; ja: string; en: string }[] = [
  { value: "RELEVANCE", ja: "おすすめ", en: "Recommended" },
  { value: "WORKS_COUNT", ja: "投稿数", en: "Posts" },
  { value: "AWARDS_COUNT", ja: "入賞数", en: "Awards" },
  { value: "LIKES_COUNT", ja: "いいね数", en: "Likes" },
  { value: "COMMENTS_COUNT", ja: "コメント数", en: "Comments" },
  { value: "VIEWS_COUNT", ja: "閲覧数", en: "Views" },
  { value: "LOGGED_IN_DAYS", ja: "活動日数", en: "Active days" },
  { value: "FOLLOWERS_COUNT", ja: "フォロワー数", en: "Followers" },
  { value: "ACTIVITY_PERIOD", ja: "活動期間", en: "Activity period" },
]

const WORKS_OPTIONS = [0, 1, 10, 50, 100]
const AWARDS_OPTIONS = [0, 1, 10, 50]
const ACTIVITY_OPTIONS: { days: number; ja: string; en: string }[] = [
  { days: 0, ja: "活動期間: 指定なし", en: "Activity: any" },
  { days: 30, ja: "1か月以上", en: "1+ month" },
  { days: 180, ja: "半年以上", en: "6+ months" },
  { days: 365, ja: "1年以上", en: "1+ year" },
  { days: 730, ja: "2年以上", en: "2+ years" },
]

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
  const [orderBy, setOrderBy] = useState<UserSearchOrderBy>("RELEVANCE")
  const [sort, setSort] = useState<"DESC" | "ASC">("DESC")
  const [minWorksCount, setMinWorksCount] = useState(0)
  const [minAwardsCount, setMinAwardsCount] = useState(0)
  const [minActivityDays, setMinActivityDays] = useState(0)
  const isFiltered =
    minWorksCount > 0 || minAwardsCount > 0 || minActivityDays > 0

  const { data, loading, error, fetchMore, refetch } = useQuery(
    searchUsersQuery,
    {
      variables: {
        offset: 0,
        limit: PAGE_SIZE,
        where: {
          search: props.query,
          orderBy,
          sort,
          ...(minWorksCount > 0 ? { minWorksCount } : {}),
          ...(minAwardsCount > 0 ? { minAwardsCount } : {}),
          ...(minActivityDays > 0 ? { minActivityDays } : {}),
        },
        ratings: props.isSensitiveMode ? ["R18"] : ["G", "R15"],
      },
      onCompleted: (result) => setHasMore(result.users.length >= PAGE_SIZE),
    },
  )

  const users = data?.users ?? []

  const controls = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Select
        value={orderBy}
        onValueChange={(value) => setOrderBy(value as UserSearchOrderBy)}
      >
        <SelectTrigger
          className="h-9 w-auto min-w-32 rounded-full"
          aria-label={t("並び順", "Sort by")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.ja, option.en)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {orderBy !== "RELEVANCE" && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1 rounded-full"
          onClick={() => setSort(sort === "DESC" ? "ASC" : "DESC")}
        >
          {sort === "DESC" ? (
            <ArrowDownWideNarrow className="size-4" />
          ) : (
            <ArrowUpNarrowWide className="size-4" />
          )}
          {sort === "DESC"
            ? t("多い順", "High to low")
            : t("少ない順", "Low to high")}
        </Button>
      )}
      <Select
        value={String(minWorksCount)}
        onValueChange={(value) => setMinWorksCount(Number(value))}
      >
        <SelectTrigger
          className="h-9 w-auto min-w-28 rounded-full"
          aria-label={t("投稿数", "Posts")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WORKS_OPTIONS.map((count) => (
            <SelectItem key={count} value={String(count)}>
              {count === 0
                ? t("投稿数: 指定なし", "Posts: any")
                : t(`投稿 ${count} 件以上`, `${count}+ posts`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(minAwardsCount)}
        onValueChange={(value) => setMinAwardsCount(Number(value))}
      >
        <SelectTrigger
          className="h-9 w-auto min-w-28 rounded-full"
          aria-label={t("入賞数", "Awards")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AWARDS_OPTIONS.map((count) => (
            <SelectItem key={count} value={String(count)}>
              {count === 0
                ? t("入賞: 指定なし", "Awards: any")
                : t(`入賞 ${count} 回以上`, `${count}+ awards`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(minActivityDays)}
        onValueChange={(value) => setMinActivityDays(Number(value))}
      >
        <SelectTrigger
          className="h-9 w-auto min-w-28 rounded-full"
          aria-label={t("活動期間", "Activity period")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACTIVITY_OPTIONS.map((option) => (
            <SelectItem key={option.days} value={String(option.days)}>
              {t(option.ja, option.en)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-full"
          onClick={() => {
            setMinWorksCount(0)
            setMinAwardsCount(0)
            setMinActivityDays(0)
          }}
        >
          {t("絞り込みを解除", "Clear filters")}
        </Button>
      )}
    </div>
  )

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
        {controls}
        {Array.from({ length: 6 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div>
        {controls}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center text-sm">
          <p>{t("ユーザーを読み込めませんでした", "Could not load users")}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t("もう一度読み込む", "Retry")}
          </Button>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div>
        {controls}
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-6">
          <PictorChanSays>
            {isFiltered
              ? t(
                  `条件に合う「${props.query}」のユーザーは見つかりませんでした。絞り込みをゆるめてみてください`,
                  `No users for "${props.query}" match these filters. Try loosening them.`,
                )
              : t(
                  `「${props.query}」のユーザーは見つかりませんでした。名前やユーザー ID の一部でも探せますよ！`,
                  `No users found for "${props.query}". Part of the name or ID works too!`,
                )}
          </PictorChanSays>
        </div>
      </div>
    )
  }

  return (
    <div>
      {controls}
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
                  src={toIconImageUrl(user.iconUrl)}
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
                {(user.worksCount > 0 || user.awardsCount > 0) && (
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    {t(
                      `投稿 ${user.worksCount}・入賞 ${user.awardsCount}`,
                      `${user.worksCount} posts · ${user.awardsCount} awards`,
                    )}
                  </p>
                )}
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
      worksCount
      awardsCount
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
