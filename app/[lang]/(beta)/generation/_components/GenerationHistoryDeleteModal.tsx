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
        <ModalHeader />
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

    /**
     * 対象が選択されている場合のモーダル
     */
    // <Modal
    //   onClose={props.onClose}
    //   isOpen={props.isOpen}
    //   scrollBehavior={"inside"}
    //   size={"sm"}
    // >
    //   <ModalOverlay />
    //   <ModalContent>
    //     <ModalHeader />
    //     <ModalBody alignItems={"center"} justifyContent={"center"}>
    //       <HStack justifyContent={"center"}>
    //         <Text>{"本当に削除しますか？"}</Text>
    //       </HStack>
    //     </ModalBody>
    //     <ModalFooter justifyContent={"center"}>
    //       <HStack justifyContent={"center"} spacing={4}>
    //         <Button
    //           borderRadius={"full"}
    //           colorScheme="primary"
    //           onClick={() => {
    //             props.onClose()
    //             alert("削除しました")
    //           }}
    //         >
    //           {"はい"}
    //         </Button>
    //         <Button
    //           borderRadius={"full"}
    //           onClick={() => {
    //             props.onClose()
    //           }}
    //         >
    //           {"やめる"}
    //         </Button>
    //       </HStack>
    //     </ModalFooter>
    //   </ModalContent>
    // </Modal>
  )
}
