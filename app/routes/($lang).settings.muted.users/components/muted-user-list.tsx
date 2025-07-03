import { AuthContext } from "~/contexts/auth-context"
import { MutedUser } from "~/routes/($lang).settings.muted.users/components/muted-user"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export function MutedUserList() {
  const appContext = useContext(AuthContext)

  const { data = null, refetch } = useSuspenseQuery(viewerMutedUsersQuery, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [mutation] = useMutation(muteUserMutation)

  const handleUnmute = async (userID: string) => {
    await mutation({
      variables: {
        input: {
          userId: userID,
        },
      },
    })
    await refetch()
  }

  return (
    <>
      {data?.viewer?.mutedUsers.length === 0 && (
        <div className="rounded bg-info p-4">
          <p>{"ミュートしているユーザはいません"}</p>
        </div>
      )}
      <div className="space-y-4">
        {data?.viewer?.mutedUsers.map((user) => (
          <MutedUser
            key={user.id}
            name={user.name}
            login={user.login}
            iconImageURL={withIconUrlFallback(user.iconUrl)}
            onClick={() => handleUnmute(user.id)}
          />
        ))}
      </div>
    </>
  )
}

const viewerMutedUsersQuery = graphql(
  `query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      id
      mutedUsers(offset: $offset, limit: $limit) {
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

const _userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      isShowingMutedUsersComments
      isShowingMutedUsersWorks
    }
  }`,
)

const muteUserMutation = graphql(
  `mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
      isMuted
    }
  }`,
)

const _updateUserSettingMutation = graphql(`
  mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      isShowingMutedUsersComments
      isShowingMutedUsersWorks
    }
  }
`)
