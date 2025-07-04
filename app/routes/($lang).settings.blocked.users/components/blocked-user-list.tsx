import { graphql } from "gql.tada"
import { BlockedUser } from "./blocked-user"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"

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

  const [mutation] = useMutation(blockUserMutation)

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

  // 仮のデータ（GraphQL実装までの暫定対応）
  const blockedUsers: BlockedUserType[] = data?.viewer?.blockedUsers ?? []

  return (
    <>
      {blockedUsers.length === 0 && (
        <div className="rounded bg-info p-4">
          <p>{"ブロックしているユーザはいません"}</p>
        </div>
      )}
      <div className="space-y-4">
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

const blockUserMutation = graphql(
  `mutation BlockUser($input: BlockUserInput!) {
    blockUser(input: $input) {
      id
      isBlocked
    }
  }`,
)
