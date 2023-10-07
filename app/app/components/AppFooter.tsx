"use client"

import { HStack, Stack, Link as ChakraLink, Text } from "@chakra-ui/react"
import Link from "next/link"

export const AppFooter: React.FC = () => {
  return (
    <Stack p={4}>
      <Stack direction={{ base: "column", md: "row" }}>
        <HStack spacing={4}>
          <ChakraLink as={Link} href={"/terms"} fontSize={"sm"}>
            {"利用規約"}
          </ChakraLink>
          <ChakraLink as={Link} href={"/privacy"} fontSize={"sm"}>
            {"プライバシーポリシー"}
          </ChakraLink>
        </HStack>
        <HStack spacing={4}>
          <Text fontSize={"sm"}>{"運営会社"}</Text>
          <Text fontSize={"sm"}>{"特定商取引法に基づく表記"}</Text>
        </HStack>
      </Stack>
      <Text fontSize={"sm"}>
        {
          "Aipictorsアプリは、AIイラスト・AIフォト・AI小説を投稿できるSNSアプリです。10万以上の沢山のAIコンテンツが投稿されています！"
        }
      </Text>
      <HStack>
        <Text fontWeight={"bold"} fontSize={"sm"}>
          {"© 2023 Aipictors.com"}
        </Text>
      </HStack>
    </Stack>
  )
}
