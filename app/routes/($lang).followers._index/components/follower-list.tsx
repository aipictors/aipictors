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

export function FollowerList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Retrieve 'mode' and 'page' from URL parameters
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
      followersOffset: 40 * page,
      followersLimit: 40,
      followersWorksOffset: 0,
      followersWorksLimit: 8,
      followersWorksWhere: {},
    },
  })

  const [refreshing, setRefreshing] = useState(false)

  // Handler for changing display mode
  const handleModeChange = (newMode: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("mode", newMode)
    setSearchParams(newSearchParams)
  }

  // Handler for page change
  const handlePageChange = (newPage: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set("page", newPage.toString())
    setSearchParams(newSearchParams)
  }

  // Refresh button handler
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
      {/* Display follower count and mode switch buttons */}
      <div className="mb-4 flex items-center justify-between">
        {/* Follower count and refresh button */}
        <div className="flex items-center">
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
        {/* Mode switch buttons for larger screens */}
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
      {/* Mode switch buttons for smaller screens */}
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

      {/* Main content displaying followers */}
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
        {/* Pagination component */}
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <ResponsivePagination
            perPage={40}
            maxCount={data?.user?.followersCount ?? 0}
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
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!,
    $followersWorksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      followersCount
      followers(offset: $followersOffset, limit: $followersLimit) {
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
