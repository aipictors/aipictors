"use client"
import { Box, HStack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainFlutterScta: FC = (props) => {
  return (
    <HStack justifyContent={"center"} py={8}>
      <Box
        maxW={"container.sm"}
        mx={"auto"}
        w={"100%"}
        px={{ base: 4, md: 12 }}
        minH={"100vh"}
      >
        <HStack justifyContent={"space-between"}>
          <Text>{"運営サービス"}</Text>
          <Text>{"Aipictors"}</Text>
        </HStack>
      </Box>
    </HStack>
  )
}
