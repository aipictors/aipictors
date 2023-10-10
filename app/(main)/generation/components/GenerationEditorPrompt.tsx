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
  Tooltip,
} from "@chakra-ui/react"
import type { PromptCategoryQuery } from "__generated__/apollo"
import { PromptCategoriesModal } from "app/(main)/generation/components/PromptCategoriesModal"

type Props = {
  promptCategories: PromptCategoryQuery["promptCategories"]
}

export const GenerationEditorPrompt: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

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
            />
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
