"use client"

import {
  Box,
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { PromptCategoriesQuery } from "__generated__/apollo"
import { PromptCategoriesModal } from "app/[lang]/(beta)/generation/_components/PromptCategoriesModal"
import { TbQuestionMark } from "react-icons/tb"

type Props = {
  promptText: string
  promptCategories: PromptCategoriesQuery["promptCategories"]
  selectedPrompts: { id: string }[]
  onSelectPromptId(id: string): void
  onChangePromptText(text: string): void
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
                <IconButton
                  aria-label={"メニュー"}
                  borderRadius={"full"}
                  icon={<Icon as={TbQuestionMark} />}
                />
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
              value={""}
            />
          </Box>
        </Stack>
      </Card>
      <PromptCategoriesModal
        onClose={onClose}
        isOpen={isOpen}
        promptCategories={props.promptCategories}
        onSelect={props.onSelectPromptId}
      />
    </>
  )
}
