"use client"

import { Stack, Text } from "@chakra-ui/react"
import { MarkdownDocument } from "app/_components/markdown-document"

type Props = {
  text: string
}

export const AppPrivacyDocument: React.FC<Props> = (props) => {
  return (
    <Stack pt={8} spacing={8}>
      <Text fontSize={"2xl"} fontWeight={"bold"}>
        {"プライバシー・ポリシー"}
      </Text>
      <MarkdownDocument>{props.text}</MarkdownDocument>
    </Stack>
  )
}
