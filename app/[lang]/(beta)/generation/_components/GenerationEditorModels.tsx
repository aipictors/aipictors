"use client"

import { Box, Button, Stack, useDisclosure } from "@chakra-ui/react"
import type { ImageModelsQuery } from "__generated__/apollo"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/GenerationEditorCard"
import { ModelsModal } from "app/[lang]/(beta)/generation/_components/ModelsModal"
import { SelectedModel } from "app/[lang]/(beta)/generation/_components/SelectedModel"
import { Config } from "config"
import { useState } from "react"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string
  onSelectModelId(id: string): void
}

export const GenerationEditorModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  /**
   * 表示されるモデルのID
   */
  const [currentModelIds, setCurrentModelIds] = useState(
    Config.defaultImageModelIds,
  )

  const currentModels = currentModelIds.map((modelId) => {
    return props.models.find((model) => {
      return model.id === modelId
    })
  })

  const onSelectModelId = (modelId: string) => {
    props.onSelectModelId(modelId)
    const draftIds = [...currentModelIds]
    const index = draftIds.indexOf(modelId)
    if (index !== -1) return
    draftIds.unshift(modelId)
    console.log("draftIds", draftIds)
    if (6 < draftIds.length) {
      draftIds.pop()
    }
    setCurrentModelIds(draftIds)
  }

  return (
    <>
      <GenerationEditorCard
        title={"モデル"}
        tooltip={"イラスト生成に使用するモデルです。絵柄などが変わります。"}
        action={
          <Button size={"sm"} borderRadius={"full"} onClick={onOpen}>
            {"モデルを変更する"}
          </Button>
        }
      >
        <Box overflowY={"auto"} p={2}>
          <Stack justifyContent={"space-between"} alignItems={"flex-start"}>
            {currentModels.map((model) => (
              <SelectedModel
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.selectedModelId}
                onClick={() => {
                  onSelectModelId(model!.id)
                }}
              />
            ))}
          </Stack>
        </Box>
      </GenerationEditorCard>
      <ModelsModal
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelId={props.selectedModelId}
        onSelect={onSelectModelId}
      />
    </>
  )
}
