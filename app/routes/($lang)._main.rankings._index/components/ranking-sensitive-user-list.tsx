import { Badge } from "~/components/ui/badge"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { Card } from "~/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"
import { Loader2, Trophy, Heart, TrendingUp } from "lucide-react"

type Props = {
  awards: FragmentOf<typeof SensitiveUserRankingListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

export function RankingSensitiveUserList (props: Props) {
  const appContext = useContext(AuthContext)
  const t = useTranslation()

  const users = props.awards

  const { data: rankingUsers, loading } = useQuery(userRankingsQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 50,
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

  // ローディング状態の処理
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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
    <div className="space-y-6">
      {/* 最大いいねでランキング化されていることを強調するヘッダー */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-2 flex w-fit items-center space-x-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white">
          <TrendingUp className="h-4 w-4" />
          <span className="font-semibold text-sm">
            {t("最大いいね数でランキング", "Ranked by Average Likes")}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          {t(
            "投稿作品の最大いいね数によってランキングされています",
            "Ranked by average number of likes per work",
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userRankings.map((userRanking) => {
          const isTopThree = userRanking.rank <= 3
          const getRankColor = (rank: number) => {
            if (rank === 1) return "from-yellow-400 to-yellow-600"
            if (rank === 2) return "from-gray-300 to-gray-500"
            if (rank === 3) return "from-amber-400 to-amber-600"
            return "from-slate-400 to-slate-600"
          }

          return (
            <Card
              key={userRanking.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${isTopThree ? `border-2 border-gradient-to-r ${getRankColor(userRanking.rank)}` : ""}`}
            >
              {/* 順位バッジ */}
              <div className="absolute top-0 right-0 z-10">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-bl-2xl bg-gradient-to-br text-white ${getRankColor(userRanking.rank)}`}
                >
                  {userRanking.rank <= 3 ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <span className="font-bold text-sm">
                      #{userRanking.rank}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* 最大いいね数を最も目立つ位置に配置 */}
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-2 flex w-fit items-center space-x-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-white">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="font-bold text-lg">
                      {userRanking.avgLikes.toFixed(1)}
                    </span>
                  </div>
                  <p className="font-medium text-muted-foreground text-xs">
                    {t("最大いいね数", "Average Likes")}
                  </p>
                </div>

                <Link
                  to={`/users/${userRanking.user?.login}`}
                  className="block"
                >
                  <div className="mb-4 flex flex-col items-center space-y-2">
                    <Avatar className="h-16 w-16 ring-2 ring-purple-200 ring-offset-2 transition-all duration-300 hover:ring-purple-400">
                      <AvatarImage
                        resizeWidth={240}
                        src={withIconUrlFallback(userRanking.user?.iconUrl)}
                        alt={userRanking.user?.name || userRanking.user?.login}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 font-bold text-white">
                        {(
                          userRanking.user?.name ||
                          userRanking.user?.login ||
                          ""
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-semibold text-base">
                        {userRanking.user?.name || userRanking.user?.login}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        @{userRanking.user?.login}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* 統計情報をモダンなデザインで表示 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3 text-center dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="font-bold text-blue-600 text-lg dark:text-blue-400">
                      {userRanking.worksCount}
                    </div>
                    <div className="text-blue-500 text-xs dark:text-blue-300">
                      {t("作品数", "Works")}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-3 text-center dark:from-green-900/20 dark:to-green-800/20">
                    <div className="font-bold text-green-600 text-lg dark:text-green-400">
                      {userRanking.likesCount}
                    </div>
                    <div className="text-green-500 text-xs dark:text-green-300">
                      {t("総いいね", "Total Likes")}
                    </div>
                  </div>
                </div>

                {/* ランキング位置の表示 */}
                {isTopThree && (
                  <div className="mt-3 text-center">
                    <Badge
                      variant="secondary"
                      className={`border-none bg-gradient-to-r text-white ${getRankColor(userRanking.rank)}`}
                    >
                      🏆{" "}
                      {userRanking.rank === 1
                        ? t("1位", "1st Place")
                        : userRanking.rank === 2
                          ? t("2位", "2nd Place")
                          : t("3位", "3rd Place")}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export const SensitiveUserRankingListItemFragment = graphql(
  `fragment SensitiveUserRankingListItem on UserRankingNode @_unmask {
    id
    date
    rank
    avgLikes
    worksCount
    likesCount
    createdAt
    user {
      id
      login
      name
      iconUrl
      followersCount
      worksCount
    }
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
