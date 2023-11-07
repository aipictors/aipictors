"use client"

import { useMutation } from "@apollo/client"
import { Button, Stack, useToast } from "@chakra-ui/react"
import {
  CreateImageGenerationTaskDocument,
  CreateImageGenerationTaskMutationResult,
  CreateImageGenerationTaskMutationVariables,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
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
  const [createTask, { loading: isLoading }] = useMutation<
    CreateImageGenerationTaskMutationResult,
    CreateImageGenerationTaskMutationVariables
  >(CreateImageGenerationTaskDocument)

  const toast = useToast()

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

  const [promptText, setPromptText] = useState("")
  console.log(promptText)

  const [negativePromptText, setNegativePromptText] = useState("")

  const [imageSize, setImageSize] = useState<number>()

  const [imageVae, setImageVae] = useState<number>()

  const [imageSeed, setImageSeed] = useState<number>()

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

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    try {
      await createTask({
        variables: {
          input: {
            count: 1,
            model: "petitcutie_v20.safetensors [6a1f2c62a7]",
            vae: "clearvae_v23.safetensors",
            prompt: promptText,
            negativePrompt: "EasyNegative, nsfw, nude, ",
            seed: 868050328,
            steps: 20,
            scale: 7,
            sampler: "DPM++ 2M Karras",
            sizeType: "SD1_512_768",
            type: "TEXT_TO_IMAGE",
          },
        },
      })
      toast({ status: "success", description: "タスクを作成しました" })
    } catch (error) {
      if (error instanceof Error) {
        toast({ status: "error", description: error.message })
      }
    }
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
          promptText={promptText}
          promptCategories={props.promptCategories}
          selectedPrompts={[]}
          onSelectPromptId={() => {}}
          onChangePromptText={setPromptText}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          promptText={negativePromptText}
          onChangePromptText={setNegativePromptText}
        />
      }
      histories={
        <Stack height={"100%"}>
          <Button
            colorScheme={"primary"}
            isLoading={isLoading}
            onClick={onCreateTask}
          >
            {"生成する"}
          </Button>
          <GenerationEditorHistory
            selectHistory={selectHistory}
            selectedHistory={selectedHistory}
          />
        </Stack>
      }
    />
  )
}
