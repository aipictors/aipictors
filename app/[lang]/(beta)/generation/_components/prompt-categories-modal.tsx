"use client"

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  Text,
  Wrap,
} from "@chakra-ui/react"
import { PromptCategoriesQuery } from "__generated__/apollo"
import { PromptCategoryIcon } from "app/[lang]/(beta)/generation/_components/prompt-category-icon"
import React, { useState } from "react"

type Props = {
  isOpen: boolean
  onClose(): void
  promptCategories: PromptCategoriesQuery["promptCategories"]
  onSelect(id: string): void
}

export const PromptCategoriesModal: React.FC<Props> = (props) => {
  const btnRef = React.useRef(null)

  const [promptIds, setPromptIds] = useState<string[]>([])

  return (
    <>
      <Modal
        onClose={props.onClose}
        finalFocusRef={btnRef}
        isOpen={props.isOpen}
        scrollBehavior="inside"
        size={"2xl"}
      >
        <ModalContent>
          <ModalHeader />
          <ModalCloseButton />
          <ModalBody>
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
                          onSelect={() => {
                            props.onSelect(prompt.id)
                          }}
                        >
                          {prompt.name}
                        </Button>
                      ))}
                    </Wrap>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </ModalBody>
          <ModalFooter justifyContent={"center"}>
            <Stack>
              <Text fontSize={"sm"}>{"※ 50個まで選択できます。"}</Text>
              <Button
                onClick={props.onClose}
                colorScheme="primary"
                borderRadius={"full"}
              >
                {"OK"}
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
