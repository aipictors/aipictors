import { IconUrl } from "@/_components/icon-url"
import { AuthContext } from "@/_contexts/auth-context"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { muteUserMutation } from "@/_graphql/mutations/mute-user"
import { MutedUser } from "@/routes/($lang).settings.muted.users/_components/muted-user"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

export const MutedUserList = () => {
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
            iconImageURL={IconUrl(user.iconUrl)}
            onClick={() => handleUnmute(user.id)}
          />
        ))}
      </div>
    </>
  )
}

export const viewerMutedUsersQuery = graphql(
  `query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      mutedUsers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }`,
  [partialUserFieldsFragment],
)
