"use client"
import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
import { Button, HStack, Input, Stack, Text, useToast } from "@chakra-ui/react"
import type {
  UpdateAccountLoginMutation,
  UpdateAccountLoginMutationVariables,
  ViewerUserQuery,
  ViewerUserQueryVariables,
} from "__generated__/apollo"
import {
  UpdateAccountLoginDocument,
  ViewerUserDocument,
} from "__generated__/apollo"
import { AppContext } from "app/_contexts/appContext"
import { useContext, useState } from "react"

export const AccountLoginForm: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    ViewerUserQuery,
    ViewerUserQueryVariables
  >(ViewerUserDocument, {
    skip: appContext.isLoading,
  })

  const toast = useToast()

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
      toast({ status: "success", title: "ユーザIDを変更しました" })
    } catch (error) {
      if (error instanceof ApolloError) {
        toast({ status: "error", title: "ユーザIDの変更に失敗しました" })
      }
    }
  }

  return (
    <Stack w={"100%"} spacing={8}>
      <Text lineHeight={1} fontWeight={"bold"} fontSize={"2xl"}>
        {"ユーザID"}
      </Text>
      <Stack>
        <Text>{"現在のユーザID"}</Text>
        <Input
          isReadOnly
          value={data?.viewer?.user?.login}
          placeholder="ユーザID"
        />
      </Stack>
      <Stack>
        <Text>{"新しいユーザID"}</Text>
        <Input
          value={userId}
          placeholder="ユーザID"
          onChange={(event) => {
            setUserId(event.target.value)
          }}
        />
      </Stack>
      <Button
        colorScheme="primary"
        borderRadius={"full"}
        lineHeight={1}
        onClick={handleSubmit}
        isLoading={loading}
      >
        {"変更を保存"}
      </Button>
    </Stack>
  )
}
