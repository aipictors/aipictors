import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import {
  ApolloError,
  useMutation,
  useSuspenseQuery,
} from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

export function AccountLoginForm() {
  const appContext = useContext(AuthContext)

  const t = useTranslation()

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
      toast(t("ユーザIDを変更しました", "User ID updated successfully"))
    } catch (error) {
      if (error instanceof ApolloError) {
        toast(t("ユーザIDの変更に失敗しました", "Failed to update User ID"))
      }
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <p>{t("現在のユーザID", "Current User ID")}</p>
        <Input
          readOnly
          value={data?.viewer?.user?.login}
          placeholder={t("ユーザID", "User ID")}
        />
      </div>
      <div className="space-y-2">
        <p>{t("新しいユーザID", "New User ID")}</p>
        <Input
          value={userId}
          placeholder={t("ユーザID", "User ID")}
          onChange={(event) => {
            setUserId(event.target.value)
          }}
        />
      </div>
      <Button disabled={loading} onClick={handleSubmit}>
        {t("変更を保存", "Save Changes")}
      </Button>
    </div>
  )
}

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
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

const updateAccountLoginMutation = graphql(
  `mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }`,
)
