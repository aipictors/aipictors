"use client"

import { Card, Stack, Textarea, Text, Box } from "@chakra-ui/react"

export const GenerationEditorNegative = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack h={"100%"} spacing={4}>
        <Text fontWeight={"bold"}>{"ネガティブ"}</Text>
        <Box h={"100%"} flex={1}>
          <Textarea h={"100%"} placeholder={"プロンプト"} />
        </Box>
      </Stack>
    </Card>
  )
}
