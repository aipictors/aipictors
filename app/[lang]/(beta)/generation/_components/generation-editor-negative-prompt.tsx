"use client"

import { Box, Button, Stack, Textarea, Wrap } from "@chakra-ui/react"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/generation-editor-card"

type Props = {
  promptText: string
  onChangePromptText(prompt: string): void
}

export const GenerationEditorNegativePrompt: React.FC<Props> = (props) => {
  const onAddPrompt = (text: string) => {
    if (props.promptText.includes(text)) {
      const replacedText = props.promptText.replace(text, "")
      const draftText = replacedText
        .split(",")
        .filter((p) => p !== "")
        .join(",")
      props.onChangePromptText(draftText)
      return
    }
    const draftText = props.promptText
      .split(",")
      .filter((p) => p !== "")
      .concat([text])
      .join(",")
    props.onChangePromptText(draftText)
  }

  return (
    <GenerationEditorCard
      title={"ネガティブ"}
      tooltip={
        "生成したくないイラストを英単語で書いてください。初期値は高品質なイラストの生成に役立つ値が入力されています。"
      }
    >
      <Box h={"100%"} flex={1} p={"1px"}>
        <Stack spacing={0} h={"100%"}>
          <Textarea
            h={"100%"}
            p={2}
            placeholder={"EasyNegativeなど"}
            borderRadius={0}
            value={props.promptText}
            onChange={(event) => {
              props.onChangePromptText(event.target.value)
            }}
            border={"none"}
            resize={"none"}
          />
          <Wrap p={2}>
            <Button
              size={"xs"}
              borderRadius={"full"}
              onClick={() => {
                onAddPrompt("+bad-hands-5")
              }}
            >
              {"+bad-hands-5"}
            </Button>
            <Button
              size={"xs"}
              borderRadius={"full"}
              onClick={() => {
                onAddPrompt("+badhandv4")
              }}
            >
              {"+badhandv4"}
            </Button>
            <Button
              size={"xs"}
              borderRadius={"full"}
              onClick={() => {
                onAddPrompt("+bad_prompt_version2")
              }}
            >
              {"+bad_prompt_version2"}
            </Button>
          </Wrap>
        </Stack>
      </Box>
    </GenerationEditorCard>
  )
}
