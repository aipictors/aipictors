"use client"

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const InPaintingImageModal: React.FC<Props> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
      size={"xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"一部修正する"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody alignItems={"center"} justifyContent={"center"}></ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button
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
