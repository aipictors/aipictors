"use client"
import { HStack, Link as ChakraLink } from "@chakra-ui/react"
import { FC } from "react"

export const BoxFooter: FC = () => {
  return (
    <HStack px={4} py={4}>
      <ChakraLink href={"https://www.aipictors.com"} fontWeight={"bold"}>
        {"© 2023 Aipictors.com"}
      </ChakraLink>
    </HStack>
  )
}
