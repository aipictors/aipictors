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
  SimpleGrid,
} from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"
import { LoraImageModelCard } from "app/[lang]/(main)/generation/components/LoraImageModelCard"

type Props = {
  isOpen: boolean
  onClose(): void
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  selectedImageLoraModelId: string | null
  onSelectImageLoraModelId(id: string | null): void
}

export const LoraModelsModal: React.FC<Props> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
      size={"full"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"LoRA選択"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 3, sm: 5, md: 7, lg: 9 }} spacing={2}>
            {props.imageLoraModels.map((imageLoraModel) => {
              return (
                <LoraImageModelCard
                  key={imageLoraModel.id}
                  imageLoraModels={props.imageLoraModels}
                  selectedImageLoraModelId={props.selectedImageLoraModelId}
                  onSelectImageLoraModelId={props.onSelectImageLoraModelId}
                  imageLoraModelId={imageLoraModel.id}
                  imageLoraModelName={imageLoraModel.name}
                  imageLoraModelDescription={imageLoraModel.description}
                  imageLoraModelImageURL={imageLoraModel.thumbnailImageURL}
                />
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
