import { ResponsivePagination } from "~/components/responsive-pagination"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { FollowingUserItem } from "~/routes/($lang).following._index/components/following-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

import { useContext, useState } from "react"
import {
  FollowerListItemFragment,
  FollowerListItemWorkFragment,
} from "~/routes/($lang).followers._index/components/follower-user-item"
import { useSearchParams } from "react-router-dom"
import { Button } from "~/components/ui/button"
import { FollowingUserProfileItem } from "~/routes/($lang).following._index/components/following-user-profile-item"
import { useTranslation } from "~/hooks/use-translation"

export function FollowingList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // URLパラメータから直接取得
  const mode = searchParams.get("mode") || "default"
  const page = Number.parseInt(searchParams.get("page") || "0", 10)

  const authContext = useContext(AuthContext)

  if (authContext.userId === undefined || !authContext.userId) {
    return null
  }

  const { data, refetch } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId,
      followeesOffset: 40 * page,
      followeesLimit: 40,
      followeesWorksOffset: 0,
      followeesWorksLimit: 8,
      followeesWorksWhere: {},
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

  return (
    <>
      {/* フォロー数とモード切替ボタン */}
      <div className="mb-4 flex items-center justify-between">
        {/* フォロー数の表示と更新ボタン */}
        <div className="flex items-center">
          <h2 className="font-bold text-xl">
            {t("フォロー中", "Following")}: {data?.user?.followeesCount ?? 0}
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
        {/* モード切替ボタン */}
        <div className="hidden md:block">
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
        </div>
      </div>
      {/* モード切替ボタン */}
      <div className="block md:hidden">
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
      </div>

      {/* 以下は既存のコード */}
      <div>
        <div className="space-y-2">
          {data?.user?.followees.map((follower, index) => (
            <div key={index.toString()} className="space-y-2">
              {mode === "default" ? (
                <FollowingUserItem user={follower} works={follower.works} />
              ) : (
                <FollowingUserProfileItem user={follower} />
              )}
              <Separator />
            </div>
          ))}
        </div>
        <div className="h-8" />
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <ResponsivePagination
            perPage={40}
            maxCount={data?.user?.followeesCount ?? 0}
            currentPage={page}
            onPageChange={(page: number) => {
              handlePageChange(page.toString())
            }}
          />
        </div>
      </div>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followeesWorksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      followeesCount
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        id
        ...FollowerListItem
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit, where: $followeesWorksWhere) {
          ...FollowerListItemWork
        }
      }
    }
  }`,
  [FollowerListItemFragment, FollowerListItemWorkFragment],
)
