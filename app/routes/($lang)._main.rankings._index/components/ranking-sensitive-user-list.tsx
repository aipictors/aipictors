import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { Badge } from "~/components/ui/badge"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  awards: FragmentOf<typeof SensitiveUserRankingListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

export function RankingSensitiveUserList(props: Props) {
  const appContext = useContext(AuthContext)
  const t = useTranslation()

  const users = props.awards

  const { data: rankingUsers } = useQuery(userRankingsQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 100,
      where: {
        date: `${props.year}-${String(props.month).padStart(2, "0")}-${String(props.day).padStart(2, "0")}`,
        orderBy: "RANK",
        sort: "ASC",
      },
    },
  })

  // デイリーランキング以外では表示しない
  if (props.day === null) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-gray-500">
          {t(
            "ユーザーランキングはデイリーのみ利用可能です",
            "User rankings are only available for daily rankings",
          )}
        </p>
      </div>
    )
  }

  const userRankings = rankingUsers?.sensitiveUserRankings ?? users

  // データが空の場合の処理
  if (!Array.isArray(userRankings) || userRankings.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-gray-500">
          {t(
            "ユーザーランキングデータがありません",
            "No user ranking data available",
          )}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden flex-wrap justify-center gap-x-4 gap-y-4 md:flex">
        {userRankings.map((user, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for ranking
              key={index}
              className="relative flex flex-col space-y-4"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="relative flex flex-col items-center">
                  <Badge
                    variant="secondary"
                    className="absolute top-0 left-0 z-10 h-6 w-8 items-center justify-center rounded-r-none rounded-b-none rounded-tl-md bg-slate-600 p-0 text-white text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <UserNameBadge
                    userId={user.user?.id ?? ""}
                    userIconImageURL={withIconUrlFallback(
                      user.user?.iconUrl ?? "",
                    )}
                    name={user.user?.name ?? ""}
                    width={"lg"}
                  />
                </div>
                <div className="flex flex-col items-center space-y-1 text-center">
                  <p className="font-bold text-sm">
                    {t("平均いいね", "Average Likes")}:{" "}
                    {user.averageLikesCount || 0}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {t("作品数", "Works")}: {user.worksCount || 0}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 md:hidden">
        {userRankings.map((user, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: index is stable for ranking
              key={index}
              className="relative flex flex-col space-y-2"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="relative flex flex-col items-center">
                  <Badge
                    variant="secondary"
                    className="absolute top-0 left-0 z-10 h-6 w-8 items-center justify-center rounded-r-none rounded-b-none rounded-tl-md bg-slate-600 p-0 text-white text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <UserNameBadge
                    userId={user.user?.id ?? ""}
                    userIconImageURL={withIconUrlFallback(
                      user.user?.iconUrl ?? "",
                    )}
                    name={user.user?.name ?? ""}
                    width={"lg"}
                  />
                </div>
                <div className="flex flex-col items-center space-y-1 text-center">
                  <p className="font-bold text-sm">
                    {t("平均いいね", "Average Likes")}:{" "}
                    {user.averageLikesCount || 0}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {t("作品数", "Works")}: {user.worksCount || 0}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {t("合計いいね", "Total Likes")}:{" "}
                    {user.totalLikesCount || 0}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export const SensitiveUserRankingListItemFragment = graphql(
  `fragment SensitiveUserRankingListItem on UserRankingNode @_unmask {
    id
    index
    user {
      id
      name
      iconUrl
      login
    }
    averageLikesCount
    worksCount
    totalLikesCount
  }`,
)

const userRankingsQuery = graphql(
  `query SensitiveUserRankings($offset: Int!, $limit: Int!, $where: UserRankingsWhereInput) {
    sensitiveUserRankings(offset: $offset, limit: $limit, where: $where) {
      ...SensitiveUserRankingListItem
    }
  }`,
  [SensitiveUserRankingListItemFragment],
)
