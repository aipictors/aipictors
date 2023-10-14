"use client"
import { Button, HStack, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"

const RootNotFound: React.FC = () => {
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
