"use client"

import { Button, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import { TbThumbUp } from "react-icons/tb"

export const MainPlusSuccess: React.FC = () => {
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
            <Text fontSize={"xl"} fontWeight={"bold"} textAlign={"center"}>
              {"決済に成功しました"}
            </Text>
            <Text>
              {
                "この度はAipictors+にご登録ありがとうございます。これからもよろしくお願いします。"
              }
            </Text>
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
