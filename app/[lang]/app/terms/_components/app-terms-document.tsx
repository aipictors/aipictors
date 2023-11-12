"use client"

import { Stack, Text } from "@chakra-ui/react"
import { MarkdownDocument } from "app/_components/markdown-document"

type Props = {
  text: string
}

export const AppTermsDocument: React.FC<Props> = (props) => {
  return (
    <Stack pt={8} spacing={8}>
      <Text fontSize={"2xl"} fontWeight={"bold"}>
        {"利用規約"}
      </Text>
      <MarkdownDocument>{props.text}</MarkdownDocument>
    </Stack>
  )
}
