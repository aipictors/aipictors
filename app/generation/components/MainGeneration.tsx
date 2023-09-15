"use client"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Icon,
  Stack,
  Text,
  Wrap,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import { TbUser } from "react-icons/tb"
import { PromptCategoryQuery } from "__generated__/apollo"

type Props = {
  promptCategoryQuery: PromptCategoryQuery
}

export const MainGeneration: FC<Props> = (props) => {
  /**
   * 青色になっているカテゴリーのIDの配列
   * １２３４５、１２３４６，
   */
  const [promptIds, setPromptIds] = useState<string[]>([])
  console.log(promptIds)

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"画像生成"}
        </Text>
        <Accordion defaultIndex={[0]}>
          {props.promptCategoryQuery.promptCategories.map((promptCategory) => (
            <AccordionItem key={promptCategory.id}>
              <AccordionButton>
                <HStack flex="1">
                  <Icon as={TbUser} />
                  <Text>{promptCategory.name}</Text>
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
