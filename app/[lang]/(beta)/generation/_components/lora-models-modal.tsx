"use client"

import { LoraImageModelCard } from "@/app/[lang]/(beta)/generation/_components/lora-image-model-card"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "@/__generated__/apollo"
import { TbX } from "react-icons/tb"

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
        <ModalHeader>
          <HStack justifyContent={"space-between"}>
            <Text>{"LoRA選択"}</Text>
            <IconButton
              aria-label={"Close"}
              icon={<Icon fontSize={"lg"} as={TbX} />}
              variant={"ghost"}
              onClick={props.onClose}
            />
          </HStack>
        </ModalHeader>
        <ModalBody py={0}>
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
