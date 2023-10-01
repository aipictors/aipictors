"use client"

import {
  Card,
  Stack,
  Text,
  Button,
  HStack,
  Box,
  Textarea,
} from "@chakra-ui/react"

export const GenerationEditorPrompt = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack h={"100%"} spacing={4}>
        <HStack justifyContent={"space-between"}>
          <Text fontWeight={"bold"}>{"プロンプト"}</Text>
          <Button borderRadius={"full"} size={"sm"}>
            {"キーワード"}
          </Button>
        </HStack>
        <Box h={"100%"} flex={1}>
          <Textarea h={"100%"} placeholder={"プロンプト"} />
        </Box>
      </Stack>
    </Card>
  )
}
