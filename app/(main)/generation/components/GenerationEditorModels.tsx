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
} from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"
import { ModelsModal } from "app/(main)/generation/components/ModelsModal"
import { Config } from "config"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
}

export const GenerationEditorModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const defaultImageModels = props.imageModels.filter((imageModel) => {
    return Config.defaultImageModelIds.includes(imageModel.id)
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
          <SimpleGrid spacing={2} columns={3}>
            {defaultImageModels.map((imageModel) => {
              return (
                <Stack key={imageModel.id}>
                  <Image
                    src={imageModel.thumbnailImageURL!}
                    alt={imageModel.displayName}
                  />
                  <Text fontSize={"sm"}>{imageModel.displayName}</Text>
                </Stack>
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
      />
    </>
  )
}
