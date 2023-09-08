"use client"
import { Button, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import { FC } from "react"
import { TbThumbUp } from "react-icons/tb"

export const MainPlusSuccess: FC = () => {
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
            <Icon as={TbThumbUp} fontSize={"8rem"} color={"green.400"} />
          </HStack>
          <Stack>
            <HStack
              justifyContent={"center"}
              fontSize={"xl"}
              fontWeight={"bold"}
            >
              <Text>{"決済に成功しました。"}</Text>
            </HStack>
            <HStack justifyContent={"center"}>
              <Text>
                {
                  "この度はピクタスにご登録ありがとうございます。これからもよろしくお願いします。"
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
