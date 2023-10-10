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
  SimpleGrid,
} from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"
import { ImageModelCard } from "app/(main)/generation/components/ImageModelCard"

type Props = {
  isOpen: boolean
  onClose(): void
  imageModels: ImageModelsQuery["imageModels"]
  selectedImageModelId: string | null
  onSelectImageModelId(id: string | null): void
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
                <ImageModelCard
                  key={imageModel.id}
                  imageModels={props.imageModels}
                  selectedImageModelId={props.selectedImageModelId}
                  onSelectImageModelId={props.onSelectImageModelId}
                  imageModelId={imageModel.id}
                  imageModelDisplayName={imageModel.displayName}
                  imageModelImageURL={imageModel.thumbnailImageURL}
                />
              )
            })}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button
            onClick={() => {
              props.onClose()
            }}
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
