import { graphql } from "gql.tada"
import { Card } from "~/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { useQuery } from "@apollo/client/index"
import { Loader2 } from "lucide-react"

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

type Props = {
  year: number
  month: number
  day: number
}

/**
 * ユーザランキング一覧
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
      limit: 100,
      where: {
        date: `${_props.year}-${String(_props.month).padStart(2, "0")}-${String(_props.day).padStart(2, "0")}`,
        orderBy: "RANK",
        sort: "ASC",
      },
    },
  })

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userRankings.map((userRanking) => (
          <Card key={userRanking.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-100 font-medium text-slate-600 text-xs">
                  {userRanking.rank}
                </div>
                <span className="text-muted-foreground text-xs">
                  {t("位", "th")}
                </span>
              </div>
              <div className="text-right text-xs">
                <div className="text-muted-foreground">
                  {t("平均いいね", "Avg. Likes")}
                </div>
                <div className="font-bold">
                  {userRanking.avgLikes.toFixed(1)}
                </div>
              </div>
            </div>

            <Link to={`/users/${userRanking.user.login}`}>
              <div className="mb-3 flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={withIconUrlFallback(userRanking.user.iconUrl)}
                    alt={userRanking.user.name || userRanking.user.login}
                  />
                  <AvatarFallback>
                    {(userRanking.user.name || userRanking.user.login).charAt(
                      0,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {userRanking.user.name || userRanking.user.login}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    @{userRanking.user.login}
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground">
                  {t("作品数", "Works")}
                </div>
                <div className="font-semibold">{userRanking.worksCount}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">
                  {t("総いいね", "Total Likes")}
                </div>
                <div className="font-semibold">{userRanking.likesCount}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
