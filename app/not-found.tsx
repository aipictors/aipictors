"use client"
import { Text, Stack, HStack, Button } from "@chakra-ui/react"
import Link from "next/link"
import { FC } from "react"

const RootNotFound: FC = () => {
  return (
    <Stack p={4} h={"100vh"} justifyContent={"center"} alignItems={"center"}>
      <Stack spacing={8} alignItems={"center"}>
        <Text>{"ページが見つかりません"}</Text>
        <HStack>
          <Button as={Link} href={"/"} lineHeight={1}>
            {"ホームに戻る"}
          </Button>
        </HStack>
      </Stack>
    </Stack>
  )
}

export default RootNotFound
