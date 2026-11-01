import { useApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useCallback, useContext } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

const STORAGE_KEY = "follow_nudge_v1"

/** 同じ作者には 30 日に 1 回まで */
const SAME_USER_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000

/** 1 日に出すのは 3 回まで（いいねを続けて押しているときにうるさくしない） */
const DAILY_LIMIT = 3

type NudgeHistory = {
  /** userId → 最後に出した時刻 */
  users: Record<string, number>
  day: string
  count: number
}

function readHistory(): NudgeHistory {
  const today = new Date().toDateString()
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const history: NudgeHistory = stored
      ? JSON.parse(stored)
      : { users: {}, day: today, count: 0 }
    if (history.day !== today) {
      history.day = today
      history.count = 0
    }
    // 古い記録は消す
    const now = Date.now()
    for (const [userId, time] of Object.entries(history.users)) {
      if (now - time > SAME_USER_INTERVAL_MS) delete history.users[userId]
    }
    return history
  } catch {
    return { users: {}, day: today, count: 0 }
  }
}

function writeHistory(history: NudgeHistory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // 保存できなくても続ける
  }
}

/**
 * いいねした作品の作者をまだフォローしていなければ、「フォローすると新作が届きます」を出す
 */
export function useFollowNudge() {
  const client = useApolloClient()

  const authContext = useContext(AuthContext)

  const t = useTranslation()

  return useCallback(
    async (targetUserId: string) => {
      if (typeof window === "undefined") return
      if (authContext.userId === null) return
      if (authContext.userId === targetUserId) return

      const history = readHistory()
      if (history.count >= DAILY_LIMIT) return
      if (history.users[targetUserId] !== undefined) return

      try {
        const { data } = await client.query({
          query: followNudgeUserQuery,
          variables: { id: targetUserId },
          fetchPolicy: "cache-first",
        })

        const user = data?.user
        if (!user || user.isFollowee || user.isBlocked) return

        history.users[targetUserId] = Date.now()
        history.count += 1
        writeHistory(history)

        toast(
          t(`${user.name}さんをフォローしますか？`, `Follow ${user.name}?`),
          {
            id: `follow-nudge-${targetUserId}`,
            description: t(
              "フォローすると新しい作品がタイムラインに届きます",
              "New works will show up in your timeline",
            ),
            duration: 6000,
            action: {
              label: t("フォロー", "Follow"),
              onClick: async () => {
                try {
                  await client.mutate({
                    mutation: followUserMutation,
                    variables: { input: { userId: targetUserId } },
                  })
                  client.cache.modify({
                    id: client.cache.identify({
                      __typename: "UserNode",
                      id: targetUserId,
                    }),
                    fields: {
                      followersCount: (count: number) => count + 1,
                    },
                  })
                  toast.success(
                    t(
                      `${user.name}さんをフォローしました`,
                      `Followed ${user.name}`,
                    ),
                  )
                } catch (error) {
                  console.error(error)
                  toast.error(
                    t("フォローできませんでした", "Failed to follow the user"),
                  )
                }
              },
            },
          },
        )
      } catch (error) {
        console.error(error)
      }
    },
    [authContext.userId, client, t],
  )
}

const followNudgeUserQuery = graphql(
  `query FollowNudgeUser($id: ID!) {
    user(id: $id) {
      id
      name
      isFollowee
      isBlocked
    }
  }`,
)

const followUserMutation = graphql(
  `mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
      isFollowee
    }
  }`,
)
