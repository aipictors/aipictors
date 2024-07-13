import { Button } from "@/_components/ui/button"
import { Input } from "@/_components/ui/input"
import { AuthContext } from "@/_contexts/auth-context"
import { updateAccountLoginMutation } from "@/_graphql/mutations/update-account-login"
import {
  ApolloError,
  useMutation,
  useSuspenseQuery,
} from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useState } from "react"
import { toast } from "sonner"

export const AccountLoginForm = () => {
  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: appContext.isLoading,
  })

  const [userId, setUserId] = useState("")

  const [mutation, { loading }] = useMutation(updateAccountLoginMutation)

  const handleSubmit = async () => {
    try {
      await mutation({
        variables: {
          input: {
            login: userId,
          },
        },
      })
      setUserId("")
      toast("ユーザIDを変更しました")
    } catch (error) {
      if (error instanceof ApolloError) {
        toast("ユーザIDの変更に失敗しました")
      }
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <p>現在のユーザID</p>
        <Input
          readOnly
          value={data?.viewer?.user?.login}
          placeholder="ユーザID"
        />
      </div>
      <div className="space-y-2">
        <p>新しいユーザID</p>
        <Input
          value={userId}
          placeholder="ユーザID"
          onChange={(event) => {
            setUserId(event.target.value)
          }}
        />
      </div>
      <Button disabled={loading} onClick={handleSubmit}>
        {"変更を保存"}
      </Button>
    </div>
  )
}

export const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      user {
        id
        biography
        login
        name
        awardsCount
        followersCount
        followCount
        iconUrl
        headerImageUrl
        webFcmToken
        generatedCount
        promptonUser {
          id
          name
        }
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdViewsCount
        createdCommentsCount
        createdBookmarksCount
      }
    }
  }`,
)
