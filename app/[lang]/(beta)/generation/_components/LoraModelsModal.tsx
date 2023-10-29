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
import { LoraImageModelCard } from "app/[lang]/(beta)/generation/_components/LoraImageModelCard"

type Props = {
  isOpen: boolean
  onClose(): void
  models: ImageLoraModelsQuery["imageLoraModels"]
  selectedModelIds: string[]
  onSelect(id: string): void
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
            {props.models.map((imageLoraModel) => {
              return (
                <LoraImageModelCard
                  key={imageLoraModel.id}
                  isActive={props.selectedModelIds.includes(imageLoraModel.id)}
                  onSelect={() => {
                    props.onSelect(imageLoraModel.id)
                  }}
                  name={imageLoraModel.name}
                  description={imageLoraModel.description}
                  imageURL={imageLoraModel.thumbnailImageURL}
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
