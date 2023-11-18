"use client"

import type {
  UpdateAccountLoginMutation,
  UpdateAccountLoginMutationVariables,
  ViewerUserQuery,
  ViewerUserQueryVariables,
} from "@/__generated__/apollo"
import {
  UpdateAccountLoginDocument,
  ViewerUserDocument,
} from "@/__generated__/apollo"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
import { useContext, useState } from "react"

export const AccountLoginForm = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    ViewerUserQuery,
    ViewerUserQueryVariables
  >(ViewerUserDocument, {
    skip: appContext.isLoading,
  })

  const { toast } = useToast()

  const [userId, setUserId] = useState("")

  const [mutation, { loading }] = useMutation<
    UpdateAccountLoginMutation,
    UpdateAccountLoginMutationVariables
  >(UpdateAccountLoginDocument)

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
      toast({ title: "ユーザIDを変更しました" })
    } catch (error) {
      if (error instanceof ApolloError) {
        toast({ title: "ユーザIDの変更に失敗しました" })
      }
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <p>現在のユーザID</p>
        <Input
          readOnly
          value={data?.viewer?.user?.login}
          placeholder="ユーザID"
        />
      </div>
      <div className="space-y-4">
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
