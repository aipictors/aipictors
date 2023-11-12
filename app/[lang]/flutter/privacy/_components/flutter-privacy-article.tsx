"use client"

import { MarkdownDocument } from "@/app/_components/markdown-document"
import { Box, HStack } from "@chakra-ui/react"

type Props = {
  text: string
}

export const FlutterPrivacyArticle: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"center"} py={8} minH={"100vh"}>
      <Box
        maxW={"container.sm"}
        mx={"auto"}
        w={"100%"}
        px={{ base: 4, md: 12 }}
      >
        <MarkdownDocument>{props.text}</MarkdownDocument>
      </Box>
    </HStack>
  )
}
