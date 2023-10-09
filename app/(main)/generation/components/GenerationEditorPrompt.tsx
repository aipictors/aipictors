"use client"

import {
  Card,
  Stack,
  Text,
  Button,
  HStack,
  Box,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import { PromptCategoriesModal } from "app/(main)/generation/components/PromptCategoriesModal"

export const GenerationEditorPrompt = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card p={4} h={"100%"}>
        <Stack h={"100%"} spacing={4}>
          <HStack justifyContent={"space-between"}>
            <Text fontWeight={"bold"}>{"プロンプト"}</Text>
            <Button borderRadius={"full"} size={"sm"} onClick={onOpen}>
              {"キーワード"}
            </Button>
          </HStack>
          <Box h={"100%"} flex={1}>
            <Textarea h={"100%"} placeholder={"プロンプト"} />
          </Box>
        </Stack>
      </Card>
      <PromptCategoriesModal onClose={onClose} isOpen={isOpen} />
    </>
  )
}
