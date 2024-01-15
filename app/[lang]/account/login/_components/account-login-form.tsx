"use client"

import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateAccountLoginMutation } from "@/graphql/mutations/update-account-login"
import { viewerUserQuery } from "@/graphql/queries/viewer/viewer-user"
import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
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
