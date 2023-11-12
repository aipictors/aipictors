"use client"

import { Box, Button, Textarea, useDisclosure } from "@chakra-ui/react"
import { PromptCategoriesQuery } from "__generated__/apollo"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/generation-editor-card"
import { PromptCategoriesModal } from "app/[lang]/(beta)/generation/_components/prompt-categories-modal"

type Props = {
  promptText: string
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onChangePromptText(text: string): void
}

export const GenerationEditorPrompt: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onSelectPromptId = (promptId: string) => {}

  return (
    <>
      <GenerationEditorCard
        title={"プロンプト"}
        tooltip={"生成したいイラストの要素をキーワードから選んでください。"}
        action={
          <Button borderRadius={"full"} size={"sm"} onClick={onOpen}>
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
            borderBottomRadius={"md"}
          />
        </Box>
      </GenerationEditorCard>
      <PromptCategoriesModal
        onClose={onClose}
        isOpen={isOpen}
        promptCategories={props.promptCategories}
        onSelect={onSelectPromptId}
      />
    </>
  )
}
