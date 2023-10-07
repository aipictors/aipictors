"use client"
import { HStack, Link as ChakraLink, Stack, Text } from "@chakra-ui/react"

export const HomeFooter: React.FC = () => {
  return (
    <Stack p={4}>
      <Stack direction={{ base: "column", md: "row" }}>
        <HStack spacing={4}>
          <ChakraLink
            href={"https://www.aipictors.com/terms/"}
            fontSize={"sm"}
            isExternal
          >
            {"利用規約"}
          </ChakraLink>
          <ChakraLink
            href={"https://www.aipictors.com/privacy/"}
            fontSize={"sm"}
            isExternal
          >
            {"プライバシーポリシー"}
          </ChakraLink>
        </HStack>
        <HStack spacing={4}>
          <ChakraLink
            href={"https://www.aipictors.com/company/"}
            fontSize={"sm"}
            isExternal
          >
            {"運営会社"}
          </ChakraLink>
          <ChakraLink
            href={"https://www.aipictors.com/commercialtransaction/"}
            fontSize={"sm"}
            isExternal
          >
            {"特定商取引法に基づく表記"}
          </ChakraLink>
        </HStack>
      </Stack>
      <Text fontSize={"sm"}>
        {
          "AipictorsはAIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。10万以上の沢山のAIコンテンツが投稿されています！無料AIイラスト、グラビア生成機も搭載されています！"
        }
      </Text>
      <HStack>
        <ChakraLink
          href={"https://www.aipictors.com"}
          fontWeight={"bold"}
          fontSize={"sm"}
        >
          {"© 2023 Aipictors.com"}
        </ChakraLink>
      </HStack>
    </Stack>
  )
}
