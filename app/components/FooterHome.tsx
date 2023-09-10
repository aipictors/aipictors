"use client"
import { HStack, Link as ChakraLink, Stack } from "@chakra-ui/react"
import { FC } from "react"

export const FooterHome: FC = () => {
  return (
    <Stack p={4}>
      <Stack direction={{ base: "column", md: "row" }}>
        <HStack spacing={4}>
          <ChakraLink isExternal href={"https://www.aipictors.com/terms/"}>
            {"利用規約"}
          </ChakraLink>
          <ChakraLink isExternal href={"https://www.aipictors.com/privacy/"}>
            {"プライバシーポリシー"}
          </ChakraLink>
        </HStack>
        <HStack spacing={4}>
          <ChakraLink isExternal href={"https://www.aipictors.com/company/"}>
            {"運営会社"}
          </ChakraLink>
          <ChakraLink
            isExternal
            href={"https://www.aipictors.com/commercialtransaction/"}
          >
            {"特定商取引法に基づく表記"}
          </ChakraLink>
        </HStack>
      </Stack>
      <HStack>
        <ChakraLink href={"https://www.aipictors.com"} fontWeight={"bold"}>
          {"© 2023 Aipictors.com"}
        </ChakraLink>
      </HStack>
    </Stack>
  )
}
