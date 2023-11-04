"use client"

import {
  Box,
  Button,
  Card,
  HStack,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/GenerationEditorCard"
import { ModelsModal } from "app/[lang]/(beta)/generation/_components/ModelsModal"
import { SelectedModel } from "app/[lang]/(beta)/generation/_components/SelectedModel"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedImageModelId: string
  onSelectImageModelId(id: string): void
}

export const GenerationEditorModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const selectedModelId = props.selectedImageModelId

  const selectedModel = props.models.find((model) => {
    return model.id === selectedModelId
  })

  return (
    <>
      <GenerationEditorCard
        title={"モデル"}
        tooltip={"イラスト生成に使用するモデルです。絵柄などが変わります。"}
        action={
          <Button size={"xs"} borderRadius={"full"} onClick={onOpen}>
            {"モデルを変更する"}
          </Button>
        }
      >
        <Box overflowY={"auto"}>
          <Stack p={4}>
            <HStack justifyContent={"space-between"}>
              <SelectedModel
                imageURL={selectedModel?.thumbnailImageURL ?? ""}
                name={selectedModel?.displayName ?? ""}
              />
            </HStack>
          </Stack>
        </Box>
      </GenerationEditorCard>
      <ModelsModal
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelId={props.selectedImageModelId}
        onSelect={props.onSelectImageModelId}
      />
    </>
  )
}
