"use client"
import { useSuspenseQuery } from "@apollo/client"
import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useState, useContext } from "react"
import type {
  ViewerUserQuery,
  ViewerUserQueryVariables,
} from "__generated__/apollo"
import { ViewerUserDocument } from "__generated__/apollo"
import { AppContext } from "app/contexts/appContext"

export const MainSettingLogin: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    ViewerUserQuery,
    ViewerUserQueryVariables
  >(ViewerUserDocument, {
    skip: appContext.isLoading,
  })

  const [userId, setUserId] = useState(data?.viewer?.user?.login ?? "")

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ユーザID"}
        </Text>
        <Stack>
          <Text>{"ユーザID（英文字必須）"}</Text>
          <Text fontSize={12}>{`変更前:${userId}`}</Text>
          <Input
            placeholder="ユーザID"
            value={userId}
            onChange={(event) => {
              setUserId(event.target.value)
            }}
          />
        </Stack>
        <Button
          colorScheme="primary"
          borderRadius={"full"}
          lineHeight={1}
          onClick={() => {}}
        >
          {"変更を保存"}
        </Button>
      </Stack>
    </HStack>
  )
}
