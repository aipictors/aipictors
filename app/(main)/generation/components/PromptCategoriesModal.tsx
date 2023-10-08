"use client"

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  Text,
} from "@chakra-ui/react"
import React from "react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const PromptCategoriesModal: React.FC<Props> = (props) => {
  const btnRef = React.useRef(null)

  return (
    <Modal
      onClose={props.onClose}
      finalFocusRef={btnRef}
      isOpen={props.isOpen}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody></ModalBody>
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
  )
}
