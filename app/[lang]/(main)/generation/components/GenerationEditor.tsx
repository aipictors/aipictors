"use client"
import { Grid, GridItem } from "@chakra-ui/react"
import { useState } from "react"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoryQuery,
} from "__generated__/apollo"

import { GenerationEditorHistory } from "app/[lang]/(main)/generation/components/GenerationEditorHistory"
import { GenerationEditorLoraModels } from "app/[lang]/(main)/generation/components/GenerationEditorLoraModels"
import { GenerationEditorModels } from "app/[lang]/(main)/generation/components/GenerationEditorModels"
import { GenerationEditorNegative } from "app/[lang]/(main)/generation/components/GenerationEditorNegative"
import { GenerationEditorPrompt } from "app/[lang]/(main)/generation/components/GenerationEditorPrompt"
import { useImageGenerationAreas } from "app/[lang]/(main)/generation/hooks/useImageGenerationAreas"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategoryQuery: PromptCategoryQuery
  ImageLoraModelsQuery: ImageLoraModelsQuery
}

export const GenerationEditor: React.FC<Props> = (props) => {
  const [selectedImageModelId, onSelectedImageModelId] = useState<
    string | null
  >(null)

  const [selectedLoraModels, selectLoraModels] = useState([
    { id: props.ImageLoraModelsQuery.imageLoraModels[0].id, value: 0 },
    { id: props.ImageLoraModelsQuery.imageLoraModels[1].id, value: 0 },
  ])

  const area = {
    models: "models",
    editorPrompt: "editor-prompt",
    histories: "histories",
    loraModels: "lora-models",
    editorNegativePrompt: "editor-negative-prompt",
  } as const

  const responsiveAreas = useImageGenerationAreas()

  const templateAreas = (responsiveAreas ?? [])
    .map((row) => `"${row.join(" ")}"`)
    .join("\n")

  /**
   * LoRAモデルを選択する
   * @param modelId
   */
  const onSelectLoraModelId = (modelId: string) => {
    const currentModelIds = selectedLoraModels.map((model) => model.id)
    const draftIds = [...currentModelIds]
    const index = draftIds.indexOf(modelId)
    if (index === -1) {
      draftIds.push(modelId)
    } else {
      draftIds.splice(index, 1)
    }
    // TODO: プランによって個数をかえる
    // 3つ以上選択されたら、最初の要素を削除する
    if (draftIds.length > 2) {
      draftIds.shift()
    }
    const draftModels = draftIds.map((id) => {
      const model = selectedLoraModels.find((model) => model.id === id)
      if (model !== undefined) {
        return model
      }
      return { id, value: 0 }
    })
    selectLoraModels(draftModels)
  }

  return (
    <Grid
      as={"main"}
      templateAreas={templateAreas}
      gridTemplateRows={{
        base: "1fr 1fr 1fr 1fr 1fr",
        sm: "1fr 1fr 1fr",
        xl: "1fr 1fr",
      }}
      gridTemplateColumns={{
        base: "1fr",
        sm: "1fr 1fr",
        xl: "1fr 1fr 1fr",
      }}
      w={"100%"}
      gap={2}
      h={"calc(100svh - 64px)"}
      px={4}
      pb={4}
      overflowY={"auto"}
    >
      <GridItem area={area.models}>
        <GenerationEditorModels
          imageModels={props.imageModels}
          selectedImageModelId={selectedImageModelId}
          onSelectImageModelId={(id) => {
            onSelectedImageModelId(id)
          }}
        />
      </GridItem>
      <GridItem area={area.loraModels}>
        <GenerationEditorLoraModels
          models={props.ImageLoraModelsQuery.imageLoraModels}
          selectedModels={selectedLoraModels}
          onSelectModelId={onSelectLoraModelId}
          onChangeValue={(id, value) => {
            const draftModels = selectedLoraModels.map((model) => {
              if (model.id === id) {
                return { ...model, value }
              }
              return model
            })
            selectLoraModels(draftModels)
          }}
        />
      </GridItem>
      <GridItem area={area.editorPrompt}>
        <GenerationEditorPrompt
          promptCategories={props.promptCategoryQuery.promptCategories}
        />
      </GridItem>
      <GridItem area={area.editorNegativePrompt}>
        <GenerationEditorNegative />
      </GridItem>
      <GridItem area={area.histories}>
        <GenerationEditorHistory />
      </GridItem>
    </Grid>
  )
}
