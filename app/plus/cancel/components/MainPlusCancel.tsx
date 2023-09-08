"use client"
import { Button, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import { FC } from "react"
import { TbMoodCry } from "react-icons/tb"

export const MainPlusCancel: FC = () => {
  return (
    <Stack
      py={16}
      minH={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack spacing={16} maxW={"sm"} px={6}>
        <Stack spacing={4}>
          <HStack justifyContent={"center"}>
            <Icon as={TbMoodCry} fontSize={"8rem"} color={"gray.400"} />
          </HStack>
          <Stack>
            <HStack
              justifyContent={"center"}
              fontSize={"xl"}
              fontWeight={"bold"}
            >
              <Text>{"決済に失敗しました"}</Text>
            </HStack>
            <HStack justifyContent={"center"}>
              <Text>
                {
                  "決済処理がキャンセルされました。再度決済を行う場合は、ホームに戻ってください。"
                }
              </Text>
            </HStack>
          </Stack>
        </Stack>
        <HStack justifyContent={"center"}>
          <Button as={Link} href={"/plus"} replace>
            {"ホームに戻る"}
          </Button>
        </HStack>
      </Stack>
    </Stack>
  )
}
