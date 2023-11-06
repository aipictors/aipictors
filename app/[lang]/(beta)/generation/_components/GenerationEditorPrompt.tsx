"use client"

import { Box, Button, Textarea, useDisclosure } from "@chakra-ui/react"
import type { PromptCategoriesQuery } from "__generated__/apollo"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/GenerationEditorCard"
import { PromptCategoriesModal } from "app/[lang]/(beta)/generation/_components/PromptCategoriesModal"

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
      <GenerationEditorCard
        title={"プロンプト"}
        tooltip={"生成したいイラストの要素をキーワードから選んでください。"}
        action={
          <Button borderRadius={"full"} size={"xs"} onClick={onOpen}>
            {"キーワード"}
          </Button>
        }
      >
        <Box h={"100%"} flex={1} p={"1px"}>
          <Textarea
            h={"100%"}
            p={2}
            placeholder={"プロンプト"}
            borderRadius={0}
            value={props.promptText}
            onChange={(event) => {
              props.onChangePromptText(event.target.value)
            }}
            border={"none"}
            resize={"none"}
            borderBottomRightRadius={"md"}
            borderBottomLeftRadius={"md"}
          />
        </Box>
      </GenerationEditorCard>
      <PromptCategoriesModal
        onClose={onClose}
        isOpen={isOpen}
        promptCategories={props.promptCategories}
        onSelect={props.onSelectPromptId}
      />
    </>
  )
}
