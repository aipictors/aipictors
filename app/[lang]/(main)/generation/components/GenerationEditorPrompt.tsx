"use client"

import {
  Box,
  Button,
  Card,
  HStack,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import type { PromptCategoryQuery } from "__generated__/apollo"
import { PromptCategoriesModal } from "app/[lang]/(main)/generation/components/PromptCategoriesModal"

type Props = {
  promptCategories: PromptCategoryQuery["promptCategories"]
  selectedPromptCategory: string
  onSelectPromptCategory(categories: string): void
}

export const GenerationEditorPrompt: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const selectedPromptCategory = props.selectedPromptCategory

  const selectedPrompt = props.promptCategories.find((prompt) => {
    return prompt.id === selectedPromptCategory
  })

  return (
    <>
      <Card p={4} h={"100%"}>
        <Stack h={"100%"} spacing={4}>
          <HStack justifyContent={"space-between"}>
            <HStack>
              <Text fontWeight={"bold"}>{"プロンプト"}</Text>
              <Tooltip
                label="生成したいイラストの要素をキーワードから選んでください。"
                fontSize="md"
              >
                <Button size={"xs"} borderRadius={"full"}>
                  {"?"}
                </Button>
              </Tooltip>
            </HStack>
            <Button borderRadius={"full"} size={"sm"} onClick={onOpen}>
              {"キーワード"}
            </Button>
          </HStack>
          <Box h={"100%"} flex={1}>
            <Textarea
              h={"100%"}
              placeholder={"プロンプト"}
              borderRadius={"md"}
              value={selectedPrompt?.name ?? ""}
            ></Textarea>
          </Box>
        </Stack>
      </Card>
      <PromptCategoriesModal
        onClose={onClose}
        isOpen={isOpen}
        promptCategories={props.promptCategories}
      />
    </>
  )
}
