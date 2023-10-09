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
  Card,
} from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"

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
                <Card key={imageModel.id}>
                  <Stack>
                    <Button
                      p={0}
                      h={"auto"}
                      overflow={"hidden"}
                      variant={"outline"}
                      borderWidth={2}
                      borderColor={
                        props.selectedImageModelId === imageModel.id
                          ? "primary.500"
                          : "gray.200"
                      }
                      onClick={() => {
                        props.onSelectImageModelId(imageModel.id)
                      }}
                    >
                      <Image
                        src={imageModel.thumbnailImageURL!}
                        alt={imageModel.displayName}
                      />
                    </Button>
                    <Text>{imageModel.displayName}</Text>
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter justifyContent={"center"}>
          <Button
            onClick={() => {
              props.onClose()
              console.log(props.selectedImageModelId)
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
