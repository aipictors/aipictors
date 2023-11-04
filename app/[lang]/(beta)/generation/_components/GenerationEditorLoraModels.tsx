"use client"

import { Box, Button, Stack, useDisclosure } from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/GenerationEditorCard"
import { LoraModelsModal } from "app/[lang]/(beta)/generation/_components/LoraModelsModal"
import { LoraModelsSettings } from "app/[lang]/(beta)/generation/_components/LoraModelsSettings"
import { SelectedLoraModel } from "app/[lang]/(beta)/generation/_components/SelectedLoraModel"

type Props = {
  /**
   * 全てのモデル
   */
  models: ImageLoraModelsQuery["imageLoraModels"]
  /**
   * 選択されたモデルのIDの配列
   */
  selectedModels: { id: string; value: number }[]
  onSelectModelId(id: string): void
  onChangeValue(id: string, value: number): void
  size: number
  setSize(size: number): void
  vae: number
  setVae(vae: number): void
  seed: number
  setSeed(seed: number): void
}

export const GenerationEditorLoraModels: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const selectedModelIds = props.selectedModels.map((model) => model.id)

  /**
   * 選択されたLoRAモデル
   */
  const selectedModels = selectedModelIds.map((id) => {
    const model = props.models.find((model) => model.id === id)
    if (model === undefined) {
      throw new Error()
    }
    return model
  })

  return (
    <>
      <GenerationEditorCard
        title={"加工（LoRA）"}
        tooltip={"イラストの絵柄を調整することができます。"}
      >
        <Box overflowY={"auto"}>
          <Stack p={4} spacing={4}>
            {selectedModels.map((model) => (
              <SelectedLoraModel
                key={model.id}
                imageURL={model.thumbnailImageURL ?? ""}
                name={model.name}
                description={model.description ?? ""}
                value={
                  props.selectedModels.find((m) => m.id === model.id)?.value ??
                  0
                }
                setValue={(value) => {
                  props.onChangeValue(model.id, value)
                }}
                onDelete={() => {
                  props.onSelectModelId(model.id)
                }}
              />
            ))}
            <Button borderRadius={"full"} onClick={onOpen}>
              {"LoRAを追加する"}
            </Button>
            <LoraModelsSettings />
          </Stack>
        </Box>
      </GenerationEditorCard>
      <LoraModelsModal
        isOpen={isOpen}
        onClose={onClose}
        models={props.models}
        selectedModelIds={selectedModelIds}
        onSelect={props.onSelectModelId}
      />
    </>
  )
}
