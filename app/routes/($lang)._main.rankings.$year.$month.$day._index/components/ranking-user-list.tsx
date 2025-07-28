import { graphql } from "gql.tada"
import { Card } from "~/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { useQuery } from "@apollo/client/index"
import { Loader2, Trophy, Heart, TrendingUp } from "lucide-react"
import { Badge } from "~/components/ui/badge"

type Props = {
  year: number
  month: number
  day: number
}

/**
 * ユーザランキング一覧（日付指定版）
 */
export function RankingUserList(_props: Props) {
  const t = useTranslation()
  console.log(
    "aa",
    `${_props.year}-${String(_props.month).padStart(2, "0")}-${String(_props.day).padStart(2, "0")}`,
  )
  // デイリーランキングのデータを取得
  const { data, loading } = useQuery(UserRankingsQuery, {
    variables: {
      offset: 0,
      limit: 50,
      where: {
        date: `${_props.year}-${String(_props.month).padStart(2, "0")}-${String(_props.day).padStart(2, "0")}`,
        orderBy: "RANK",
        sort: "ASC",
      },
    },
  })

  console.log("data", data)

  // データを順位の昇順でソート（1位、2位、3位...の順）
  const userRankings = (
    (data?.userRankings || []) as Array<{
      id: string
      rank: number
      avgLikes: number
      worksCount: number
      likesCount: number
      user: {
        id: string
        login: string
        name: string
        iconUrl: string
      }
    }>
  )
    .slice()
    .sort((a, b) => a.rank - b.rank)

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (userRankings.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          {t(
            "ユーザランキングが見つかりませんでした",
            "No user rankings found",
          )}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 平均いいねでランキング化されていることを強調するヘッダー */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-2 flex w-fit items-center space-x-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white">
          <TrendingUp className="h-4 w-4" />
          <span className="font-semibold text-sm">
            {t("平均いいね数でランキング", "Ranked by Average Likes")}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          {t(
            "投稿作品の平均いいね数によってランキングされています",
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
                {/* 平均いいね数を最も目立つ位置に配置 */}
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-2 flex w-fit items-center space-x-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-white">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="font-bold text-lg">
                      {userRanking.avgLikes.toFixed(1)}
                    </span>
                  </div>
                  <p className="font-medium text-muted-foreground text-xs">
                    {t("平均いいね数", "Average Likes")}
                  </p>
                </div>

                <Link to={`/users/${userRanking.user.login}`} className="block">
                  <div className="mb-4 flex flex-col items-center space-y-2">
                    <Avatar className="h-16 w-16 ring-2 ring-purple-200 ring-offset-2 transition-all duration-300 hover:ring-purple-400">
                      <AvatarImage
                        src={withIconUrlFallback(userRanking.user.iconUrl)}
                        alt={userRanking.user.name || userRanking.user.login}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 font-bold text-white">
                        {(
                          userRanking.user.name || userRanking.user.login
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <div className="font-semibold text-base">
                        {userRanking.user.name || userRanking.user.login}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        @{userRanking.user.login}
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

export const UserRankingListItemFragment = graphql(
  `fragment UserRankingListItem on UserRankingNode {
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

const UserRankingsQuery = graphql(
  `query UserRankings($offset: Int!, $limit: Int!, $where: UserRankingsWhereInput) {
    userRankings(offset: $offset, limit: $limit, where: $where) {
      ...UserRankingListItem
    }
  }`,
  [UserRankingListItemFragment],
)
