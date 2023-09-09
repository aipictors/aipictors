"use client"
import { Button, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import { FC } from "react"

export const CommercialTransaction: FC = () => {
  return (
    <Stack
      py={16}
      minH={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack spacing={16} maxW={"sm"} px={6}>
        <Stack spacing={4}>
          <Stack>
            <Text fontSize={"xl"} fontWeight={"bold"} textAlign={"center"}>
              {"特定商取引法に基づく表記"}
            </Text>
          </Stack>
        </Stack>
        <HStack justifyContent={"center"}>
          <Button as={Link} href={"/commercialtransaction"} replace>
            {"ホームに戻る"}
          </Button>
        </HStack>
      </Stack>
    </Stack>
  )
}