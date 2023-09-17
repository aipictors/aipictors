"use client"
import { Box, HStack } from "@chakra-ui/react"
import type { FC } from "react"
import { BoxMarkdown } from "app/components/BoxMarkdown"

type Props = {
  text: string
}

export const MainFlutterTerms: FC<Props> = (props) => {
  return (
    <HStack justifyContent={"center"} py={8} minH={"100vh"}>
      <Box
        maxW={"container.sm"}
        mx={"auto"}
        w={"100%"}
        px={{ base: 4, md: 12 }}
      >
        <BoxMarkdown>{props.text}</BoxMarkdown>
      </Box>
    </HStack>
  )
}
