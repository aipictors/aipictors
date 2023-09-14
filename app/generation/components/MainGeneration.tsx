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
import { FC } from "react"
import { TbUser } from "react-icons/tb"
import { PromptCategoryQuery } from "__generated__/apollo"

type Props = {
  promptCategoryQuery: PromptCategoryQuery
}

export const MainGeneration: FC<Props> = (props) => {
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
                    <Button size={"xs"} key={prompt.id}>
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
