"use client"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Stack,
  Text,
  Wrap,
} from "@chakra-ui/react"
import { useState } from "react"
import type { PromptCategoryQuery } from "__generated__/apollo"
import { PromptCategoryIcon } from "app/[lang]/(main)/generation/components/PromptCategoryIcon"

type Props = {
  promptCategories: PromptCategoryQuery["promptCategories"]
}

export const GenerationEditorLite: React.FC<Props> = (props) => {
  /**
   * 青色になっているカテゴリーのIDの配列
   */
  const [promptIds, setPromptIds] = useState<string[]>([])

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"画像生成"}
        </Text>
        <Accordion defaultIndex={[0]} allowToggle>
          {props.promptCategories.map((promptCategory) => (
            <AccordionItem key={promptCategory.id}>
              <AccordionButton>
                <HStack flex="1">
                  <PromptCategoryIcon name={promptCategory.name} />
                  <Text>{promptCategory.name}</Text>
                  <Text>
                    {promptCategory.prompts
                      .filter((prompt) => promptIds.includes(prompt.id))
                      .map((prompt) => {
                        return prompt.name
                      })
                      .join(",")}
                  </Text>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Wrap>
                  {promptCategory.prompts.map((prompt) => (
                    <Button
                      size={"xs"}
                      key={prompt.id}
                      onClick={() => {
                        const newPromptIds = promptIds.includes(prompt.id)
                          ? promptIds.filter((id) => id !== prompt.id)
                          : [...promptIds, prompt.id]
                        setPromptIds(newPromptIds)
                      }}
                      colorScheme={
                        promptIds.includes(prompt.id) ? "blue" : "gray"
                      }
                    >
                      {prompt.name}
                    </Button>
                  ))}
                </Wrap>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        <Button colorScheme={"primary"}>{"生成"}</Button>
      </Stack>
    </HStack>
  )
}
