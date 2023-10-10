"use client"

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  HStack,
} from "@chakra-ui/react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const GenerationHistoryDlModal: React.FC<Props> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
      size={"sm"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalBody alignItems={"center"} justifyContent={"center"}>
          <HStack justifyContent={"center"}>
            <Text>{"ダウンロード対象を選択してください"}</Text>
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
