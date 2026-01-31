import { ResponsivePagination } from "~/components/responsive-pagination"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { FollowerUserItem } from "~/routes/($lang).followers._index/components/follower-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

import { useContext, useState } from "react"
import {
  FollowerListItemFragment,
  FollowerListItemWorkFragment,
} from "~/routes/($lang).followers._index/components/follower-user-item"
import { useSearchParams } from "react-router-dom"
import { Button } from "~/components/ui/button"
import { FollowerUserProfileItem } from "~/routes/($lang).followers._index/components/follower-user-profile-item"
import { useTranslation } from "~/hooks/use-translation"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"

export function FollowerList () {
  const [searchParams, setSearchParams] = useSearchParams()

  // URL パラメータから取得
  const mode = searchParams.get("mode") || "default"
  const page = Number.parseInt(searchParams.get("page") || "0", 10)
  const perPage = Number.parseInt(searchParams.get("perPage") || "50", 10)

  // 型に基づいてパラメータを取得
  const orderByParam = searchParams.get(
    "orderBy",
  ) as IntrospectionEnum<"FollowerOrderBy"> | null
  const sortParam = searchParams.get("sort") as SortType | null

  // パラメータが有効な値かをチェック
  const orderBy = orderByParam
    ? orderByParam
    : ("DATE_FOLLOWED" as IntrospectionEnum<"FollowerOrderBy">)

  const sort = sortParam ? sortParam : ("DESC" as SortType)

  const authContext = useContext(AuthContext)

  const { data, refetch } = useSuspenseQuery(userQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      userId: authContext.userId ?? "",
      followersOffset: perPage * page,
      followersLimit: perPage,
      followersWorksOffset: 0,
      followersWorksLimit: 8,
      followersWorksWhere: {},
      followersWhere: {
        orderBy: orderBy,
        sort: sort,
      },
    },
  })

  const [refreshing, setRefreshing] = useState(false)

  // モード変更ハンドラ
  const handleModeChange = (newMode: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("mode", newMode)
    setSearchParams(newSearchParams)
  }

  // ページ変更ハンドラ
  const handlePageChange = (newPage: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("page", newPage.toString())
    setSearchParams(newSearchParams)
  }

  // ソートオプション変更ハンドラ
  const handleOrderByChange = (
    newOrderBy: IntrospectionEnum<"FollowerOrderBy">,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("orderBy", newOrderBy)
    setSearchParams(newSearchParams)
  }

  const handleSortChange = (newSort: SortType) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("sort", newSort)
    setSearchParams(newSearchParams)
  }

  // perPage変更ハンドラ
  const handlePerPageChange = (newPerPage: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("perPage", newPerPage)
    setSearchParams(newSearchParams)
  }

  // 更新ボタンのハンドラ
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  const t = useTranslation()

  if (authContext.userId === undefined || !authContext.userId) {
    return null
  }

  return (
    <div className="container">
      {/* フォロワー数と操作ボタン */}
      <div className="mb-4 flex flex-col items-start justify-between md:flex-row md:items-center">
        {/* フォロワー数の表示と更新ボタン */}
        <div className="mb-2 flex items-center md:mb-0">
          <h2 className="font-bold text-xl">
            {t("フォロワー", "Followers")}: {data?.user?.followersCount ?? 0}
            {t("人", "people")}
          </h2>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-2"
          >
            {t("更新", "Refresh")}
          </Button>
        </div>
        {/* モード切替ボタンとソートセレクタ */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {/* モード切替ボタン */}
          <Button
            variant={mode === "default" ? "default" : "secondary"}
            onClick={() => handleModeChange("default")}
          >
            {t("作品表示", "Work display")}
          </Button>
          <Button
            variant={mode === "simple" ? "default" : "secondary"}
            onClick={() => handleModeChange("simple")}
            className="ml-2"
          >
            {t("シンプル表示", "Simple display")}
          </Button>
          {/* ソートセレクタ */}
          <div className="flex items-center space-x-2">
            <Select value={orderBy} onValueChange={handleOrderByChange}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder={t("選択", "Select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"DATE_FOLLOWED"}>
                  {t("フォローされた日", "Date Followed")}
                </SelectItem>
                <SelectItem value={"DATE_UPDATED"}>
                  {t("更新日", "Date Updated")}
                </SelectItem>
                <SelectItem value={"DATE_CREATED"}>
                  {t("登録日", "Date Created")}
                </SelectItem>
                <SelectItem value={"DATE_POSTED"}>
                  {t("作品投稿日", "Date Posted")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder={t("選択", "Select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"DESC"}>
                  {t("降順", "Descending")}
                </SelectItem>
                <SelectItem value={"ASC"}>{t("昇順", "Ascending")}</SelectItem>
              </SelectContent>
            </Select>
            {/* perPageセレクタ */}
            <Select
              value={perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder={t("選択", "Select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"10"}>{t("10件", "10 items")}</SelectItem>
                <SelectItem value={"50"}>{t("50件", "50 items")}</SelectItem>
                <SelectItem value={"100"}>{t("100件", "100 items")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 以下は既存のコード */}
      <div>
        <div className="space-y-2">
          {data?.user?.followers.map((follower, index) => (
            <div key={index.toString()} className="space-y-2">
              {mode === "default" ? (
                <FollowerUserItem user={follower} works={follower.works} />
              ) : (
                <FollowerUserProfileItem user={follower} />
              )}
              <Separator />
            </div>
          ))}
        </div>
        <div className="h-8" />
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
          <ResponsivePagination
            perPage={perPage}
            maxCount={data?.user?.followersCount ?? 0}
            currentPage={page}
            onPageChange={(page: number) => {
              handlePageChange(page.toString())
            }}
          />
        </div>
      </div>
    </div>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!,
    $followersWorksWhere: UserWorksWhereInput,
    $followersWhere: FollowerWhereInput
  ) {
    user(id: $userId) {
      id
      followersCount
      followers(offset: $followersOffset, limit: $followersLimit, where: $followersWhere) {
        id
        ...FollowerListItem
        works(offset: $followersWorksOffset, limit: $followersWorksLimit, where: $followersWorksWhere) {
          ...FollowerListItemWork
        }
      }
    }
  }`,
  [FollowerListItemFragment, FollowerListItemWorkFragment],
)
