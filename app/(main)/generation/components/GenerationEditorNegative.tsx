"use client"

import { Card, Stack, Textarea, Text } from "@chakra-ui/react"

export const GenerationEditorNegative = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack>
        <Text fontWeight={"bold"}>{"ネガティブ"}</Text>
        <Textarea placeholder={"プロンプト"} />
      </Stack>
    </Card>
  )
}
