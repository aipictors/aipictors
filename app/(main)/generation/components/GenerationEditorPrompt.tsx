"use client"

import { Card, Stack, Textarea, Text, Button, HStack } from "@chakra-ui/react"

export const GenerationEditorPrompt = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack>
        <Text fontWeight={"bold"}>{"プロンプト"}</Text>
        <HStack>
          <Button borderRadius={"full"}>{"キーワードから選択"}</Button>
        </HStack>
        <Textarea placeholder={"プロンプト"} />
      </Stack>
    </Card>
  )
}
