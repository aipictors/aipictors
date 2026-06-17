import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"

export type SupportRankingItemWithUser = {
  rank: number
  userId: string
  coinAmount: number
  ptAmount: number
  freePtAmount: number
  premiumPtAmount: number
  transferCount: number
  isAnonymous?: boolean
  iconUrl?: string | null
  userName?: string | null
  userLogin?: string | null
}

const ANONYMOUS_SUPPORT_USER_ID = "__anonymous__"

export async function enrichSupportRankingItems<T extends SupportRankingItemWithUser>(
  items: T[],
): Promise<T[]> {
  const uniqueUserIds = Array.from(
    new Set(
      items
        .filter(
          (item) =>
            item.isAnonymous !== true && item.userId !== ANONYMOUS_SUPPORT_USER_ID,
        )
        .map((item) => item.userId),
    ),
  )

  const users = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const response = await loaderClient.query({
          query: supportRankingUserQuery,
          variables: { userId },
          fetchPolicy: "no-cache",
        })

        return [userId, response.data.user] as const
      } catch {
        return [userId, null] as const
      }
    }),
  )

  const userMap = new Map(users)

  return items.map((item) => {
    if (item.isAnonymous === true || item.userId === ANONYMOUS_SUPPORT_USER_ID) {
      return {
        ...item,
        userId: ANONYMOUS_SUPPORT_USER_ID,
        iconUrl: null,
        userName: "匿名",
        userLogin: null,
      }
    }

    const user = userMap.get(item.userId)

    return {
      ...item,
      iconUrl: user?.iconUrl ?? item.iconUrl ?? null,
      userName: user?.name ?? item.userName ?? null,
      userLogin: user?.login ?? item.userLogin ?? null,
    }
  })
}

const supportRankingUserQuery = graphql(
  `query SupportRankingUser($userId: ID!) {
    user(id: $userId) {
      id
      login
      name
      iconUrl
    }
  }`,
)