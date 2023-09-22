"use client"
import { ApolloError, useMutation, useSuspenseQuery } from "@apollo/client"
import { Button, HStack, Input, Stack, Text, useToast } from "@chakra-ui/react"
import { useState, useContext } from "react"
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
import { AppContext } from "app/contexts/appContext"

export const MainSettingLogin: React.FC = () => {
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
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
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
    </HStack>
  )
}
