"use client"

import {
  Button,
  Card,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  Image,
  Input,
} from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"
import { ModelsModal } from "app/(main)/generation/components/ModelsModal"
import { Config } from "config"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  selectedImageModelId: string | null
  onSelectImageModelId(id: string | null): void
}

export const GenerationEditorModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const defaultModels = props.imageModels.filter((imageModel) => {
    return Config.defaultImageModelIds.includes(imageModel.id)
  })

  const selectedModel = props.imageModels.find((imageModel) => {
    return imageModel.id === props.selectedImageModelId
  })

  return (
    <>
      <Card p={4} h={"100%"}>
        <Stack>
          <HStack>
            <Text fontWeight={"bold"}>{"モデル"}</Text>
            <Tooltip
              label="イラスト生成に使用するモデルです。絵柄などが変わります。"
              fontSize="md"
            >
              <Button size={"xs"} borderRadius={"full"}>
                {"?"}
              </Button>
            </Tooltip>
          </HStack>
          <Input
            borderRadius={"md"}
            size={"xs"}
            value={selectedModel?.displayName}
            isReadOnly
          />
          <SimpleGrid spacing={2} columns={3}>
            {defaultModels.map((imageModel) => {
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
                        // const index = defaultImageModels.findIndex((model) => {
                        //   return model.id === imageModel.id
                        // })
                        // defaultImageModels.splice(index, 1)
                        // defaultImageModels.unshift(imageModel)
                      }}
                    >
                      <Image
                        src={imageModel.thumbnailImageURL!}
                        alt={imageModel.displayName}
                        borderRadius={"md"}
                      />
                    </Button>
                    <Text fontSize={"sm"}>{imageModel.displayName}</Text>
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
          <Button borderRadius={"full"} onClick={onOpen}>
            {"もっとモデルを表示する"}
          </Button>
        </Stack>
      </Card>
      <ModelsModal
        onClose={onClose}
        isOpen={isOpen}
        imageModels={props.imageModels}
        selectedImageModelId={props.selectedImageModelId}
        onSelectImageModelId={props.onSelectImageModelId}
      />
    </>
  )
}
