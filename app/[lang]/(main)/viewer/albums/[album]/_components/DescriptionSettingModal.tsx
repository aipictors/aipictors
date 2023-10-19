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
  onClose: () => void
}

export const DescriptionSettingModal: React.FC<Props> = (props) => {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"Modal Title"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody />
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={props.onClose}>
            {" Close"}
          </Button>
          <Button variant="ghost">{"Secondary Action"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
