"use client"

import {
  MuteUserDocument,
  MuteUserMutation,
  MuteUserMutationVariables,
  ViewerMutedUsersDocument,
  ViewerMutedUsersQuery,
  ViewerMutedUsersQueryVariables,
} from "@/__generated__/apollo"
import { MutedUser } from "@/app/[lang]/settings/muted/users/_components/muted-user"
import { AuthContext } from "@/app/_contexts/auth-context"
import { useMutation, useSuspenseQuery } from "@apollo/client"
import { useContext } from "react"

export const MutedUserList = () => {
  const appContext = useContext(AuthContext)

  const { data = null, refetch } = useSuspenseQuery<
    ViewerMutedUsersQuery,
    ViewerMutedUsersQueryVariables
  >(ViewerMutedUsersDocument, {
    skip: appContext.isLoading,
    variables: { offset: 0, limit: 128 },
  })

  const [mutation] = useMutation<MuteUserMutation, MuteUserMutationVariables>(
    MuteUserDocument,
  )

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
        <div className="bg-info rounded p-4">
          <p>{"ミュートしているユーザはいません"}</p>
        </div>
      )}
      <div className="space-y-4">
        {data?.viewer?.mutedUsers.map((user) => (
          <MutedUser
            key={user.id}
            name={user.name}
            iconImageURL={user.iconImage?.downloadURL ?? null}
            onClick={() => handleUnmute(user.id)}
          />
        ))}
      </div>
    </>
  )
}
