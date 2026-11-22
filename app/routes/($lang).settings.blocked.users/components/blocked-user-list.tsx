import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { UserXIcon } from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { SettingsEmptyState } from "~/routes/($lang).settings/components/settings-section"
import { BlockedUser } from "./blocked-user"

type BlockedUserType = {
  id: string
  name: string
  login: string
  iconUrl: string | null
}

export function BlockedUserList() {
  const appContext = useContext(AuthContext)

  const { data = null, refetch } = useSuspenseQuery(viewerBlockedUsersQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [mutation] = useMutation(unblockUserMutation)

  const handleUnblock = async (userID: string) => {
    await mutation({
      variables: {
        input: {
          userId: userID,
        },
      },
    })
    await refetch()
    console.log("Unblocking user:", userID)
  }

  const blockedUsers: BlockedUserType[] = data?.viewer?.blockedUsers ?? []

  return (
    <>
      {blockedUsers.length === 0 && (
        <SettingsEmptyState
          icon={<UserXIcon />}
          title="ブロックしているユーザはいません"
          description="ユーザーページの「…」からブロックすると、ここに並びます。"
        />
      )}
      <div className="space-y-2">
        {blockedUsers.map((user) => (
          <BlockedUser
            key={user.id}
            userId={user.id}
            name={user.name}
            login={user.login}
            iconImageURL={user.iconUrl ?? "/images/default-avatar.png"}
            onClick={() => handleUnblock(user.id)}
          />
        ))}
      </div>
    </>
  )
}

const viewerBlockedUsersQuery = graphql(
  `query ViewerBlockedUsers($offset: Int!, $limit: Int!) {
    viewer {
      id
      blockedUsers(offset: $offset, limit: $limit) {
        id
        nanoid
        login
        name
        iconUrl
        isFollowee
        isFollower
        iconUrl
      }
    }
  }`,
)

const unblockUserMutation = graphql(
  `mutation BlockUser($input: UnblockUserInput!) {
    unblockUser(input: $input) {
      id
      isBlocked
    }
  }`,
)
