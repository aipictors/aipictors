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
  onClose: () => void
}

export const AlbumWorkDeleteModal: React.FC<Props> = (props) => {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalBody justifyContent={"center"}>
          <HStack justifyContent={"center"}>
            <Text>{"選択した作品を削除しますか？"}</Text>
          </HStack>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              props.onClose()
              alert("削除しました")
            }}
          >
            {"OK"}
          </Button>
          <Button onClick={props.onClose}>{"やめる"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
