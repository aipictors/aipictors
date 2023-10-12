"use client"

import {
  Card,
  Stack,
  Textarea,
  Text,
  Box,
  HStack,
  Button,
  Tooltip,
} from "@chakra-ui/react"

export const GenerationEditorNegative = () => {
  return (
    <Card p={4} h={"100%"}>
      <Stack h={"100%"} spacing={4}>
        <HStack>
          <Text fontWeight={"bold"}>{"ネガティブ"}</Text>
          <Tooltip
            label="生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
            fontSize="md"
          >
            <Button size={"xs"} borderRadius={"full"}>
              {"?"}
            </Button>
          </Tooltip>
        </HStack>
        <Box h={"100%"} flex={1}>
          <Textarea h={"100%"} placeholder={"プロンプト"} borderRadius={"md"} />
        </Box>
      </Stack>
    </Card>
  )
}
