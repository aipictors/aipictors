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
  Text,
  Image,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"

type Props = {
  isOpen: boolean
  onClose(): void
  imageModels: ImageModelsQuery["imageModels"]
}

export const ModelsModal: React.FC<Props> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
      size={"xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"モデル選択"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{"美少女イラスト"}</Text>
          <Text>{"美男子イラスト"}</Text>
          <Text>{"グラビア"}</Text>
          <Text>{"背景"}</Text>
          <Text>{"獣系"}</Text>
          <SimpleGrid columns={{ base: 3, sm: 3, md: 4 }} spacing={2}>
            {props.imageModels.map((imageModel) => {
              return (
                <Stack key={imageModel.id}>
                  <Image
                    src={imageModel.thumbnailImageURL!}
                    alt={imageModel.displayName}
                    onClick={() => {}}
                  />
                  <Text>{imageModel.displayName}</Text>
                </Stack>
              )
            })}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button
            onClick={props.onClose}
            borderRadius={"full"}
            colorScheme="primary"
          >
            {"OK"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
