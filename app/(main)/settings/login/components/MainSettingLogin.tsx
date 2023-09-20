"use client"
import { Button, HStack, Input, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"

export const MainSettingLogin: React.FC = () => {
  const [userId, setUserId] = useState("")

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"ユーザID"}
        </Text>
        <Stack>
          <Text>{"ユーザID（英文字必須）"}</Text>
          <Text fontSize={12}>{"変更前：変更前ID"}</Text>
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
