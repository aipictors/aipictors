"use client"

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const InPaintingSelectedPromptModal: React.FC<Props> = (props) => {
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
          <Stack alignItems={"center"} spacing={4}>
            <Text fontSize={"lg"}>{"選択したプロンプト"}</Text>
            <Stack spacing={2} alignItems={"center"}>
              <Text fontSize={"xs"}>{"Model:"}</Text>
              <Text fontSize={"xs"}>{"VAE: "}</Text>
              <Text fontSize={"xs"}>{"Prompts:"}</Text>
              <Text fontSize={"xs"}>{"Negative Prompts: "}</Text>
              <Text fontSize={"xs"}>{"Seed:"}</Text>
              <Text fontSize={"xs"}>{"steps:"}</Text>
              <Text fontSize={"xs"}>{"Scale:"}</Text>
              <Text fontSize={"xs"}>{"Sampler: "}</Text>
              <Text fontSize={"xs"}>{"Width: "}</Text>
              <Text fontSize={"xs"}>{"Height: "}</Text>
            </Stack>
            <Button
              borderRadius={"full"}
              colorScheme="primary"
              onClick={() => {
                props.onClose()
              }}
            >
              {"Close"}
            </Button>
          </Stack>
        </ModalBody>
        <ModalFooter justifyContent={"center"} />
      </ModalContent>
    </Modal>
  )
}
