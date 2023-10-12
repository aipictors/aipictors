"use client"

import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const GenerationHistoryDeleteModal: React.FC<Props> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalBody>
          <HStack justifyContent={"center"}>
            <Text>{"削除する履歴を選択してください"}</Text>
          </HStack>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button
            borderRadius={"full"}
            colorScheme="primary"
            onClick={() => {
              props.onClose()
            }}
          >
            {"OK"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
