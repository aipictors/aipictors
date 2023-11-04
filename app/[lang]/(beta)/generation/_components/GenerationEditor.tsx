"use client"

import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
} from "__generated__/apollo"
import { GenerationEditorHistory } from "app/[lang]/(beta)/generation/_components/GenerationEditorHistory"
import { GenerationEditorLayout } from "app/[lang]/(beta)/generation/_components/GenerationEditorLayout"
import { GenerationEditorLoraModels } from "app/[lang]/(beta)/generation/_components/GenerationEditorLoraModels"
import { GenerationEditorModels } from "app/[lang]/(beta)/generation/_components/GenerationEditorModels"
import { GenerationEditorNegativePrompt } from "app/[lang]/(beta)/generation/_components/GenerationEditorNegativePrompt"
import { GenerationEditorPrompt } from "app/[lang]/(beta)/generation/_components/GenerationEditorPrompt"
import { Config } from "config"
import { useState } from "react"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
}

export const GenerationEditor: React.FC<Props> = (props) => {
  /**
   * 選択された画像モデルのID
   */
  const [selectedImageModelId, onSelectedImageModelId] = useState(
    Config.defaultImageModelId,
  )

  /**
   * 選択されたLoRAモデルのID
   */
  const [selectedLoraModels, selectLoraModels] = useState(() => {
    return Config.defaultImageLoraModelIds.map((id) => {
      return { id, value: 0 }
    })
  })

  const [imageSize, setImageSize] = useState<number>()

  const [imageVae, setImageVae] = useState<number>()

  const [imageSeed, setImageSeed] = useState<number>()

  const [selectedNegativePromptCategories, setSelectNegativePromptCategories] =
    useState<string>()

  const [selectedHistory, selectHistory] = useState("")

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
    <GenerationEditorLayout
      models={
        <GenerationEditorModels
          models={props.imageModels}
          selectedImageModelId={selectedImageModelId}
          onSelectImageModelId={(id) => {
            onSelectedImageModelId(id)
          }}
        />
      }
      loraModels={
        <GenerationEditorLoraModels
          models={props.imageLoraModels}
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
          size={0}
          setSize={(size) => {
            setImageSize(size)
          }}
          vae={0}
          setVae={(vae) => {
            setImageVae(vae)
          }}
          seed={0}
          setSeed={(seed) => {
            setImageSeed(seed)
          }}
        />
      }
      promptEditor={
        <GenerationEditorPrompt
          promptCategories={props.promptCategories}
          selectedPrompts={[]}
          onSelectPromptId={() => {}}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          negativePrompt={selectedNegativePromptCategories ?? ""}
          setNegativePrompt={(prompt) => {
            setSelectNegativePromptCategories(prompt)
          }}
        />
      }
      histories={
        <GenerationEditorHistory
          selectHistory={selectHistory}
          selectedHistory={selectedHistory}
        />
      }
    />
  )
}
