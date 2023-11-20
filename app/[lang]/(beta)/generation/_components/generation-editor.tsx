"use client"

import {
  CreateImageGenerationTaskDocument,
  CreateImageGenerationTaskMutationResult,
  CreateImageGenerationTaskMutationVariables,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/__generated__/apollo"
import { GenerationEditorConfig } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config"
import { GenerationEditorHistory } from "@/app/[lang]/(beta)/generation/_components/generation-editor-history"
import { GenerationEditorLayout } from "@/app/[lang]/(beta)/generation/_components/generation-editor-layout"
import { GenerationEditorModels } from "@/app/[lang]/(beta)/generation/_components/generation-editor-models"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-prompt"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Config } from "@/config"
import { useMutation } from "@apollo/client"
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

  const { toast } = useToast()

  /**
   * 選択された画像モデルのID
   */
  const [selectedModelId, setSelectedModelId] = useState(
    Config.defaultImageModelId,
  )

  /**
   * 選択されたLoRAモデルのID
   */
  const [selectedLoraModelConfigs, setSelectedLoraModelConfigs] = useState(
    () => {
      return Config.defaultImageLoraModelIds.map((id) => {
        return { id, value: 0 }
      })
    },
  )

  const [promptText, setPromptText] = useState("")

  const [negativePromptText, setNegativePromptText] = useState("")

  const [imageSize, setImageSize] = useState("SD1_512_768")

  const [imageVae, setImageVae] = useState<number>()

  const [imageSeed, setImageSeed] = useState<number>()

  const [selectedHistory, selectHistory] = useState("")

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
      toast({ description: "タスクを作成しました" })
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message })
      }
    }
  }

  return (
    <GenerationEditorLayout
      models={
        <GenerationEditorModels
          models={props.imageModels}
          selectedModelId={selectedModelId}
          onSelectModelId={(id) => {
            setSelectedModelId(id)
          }}
        />
      }
      loraModels={
        <GenerationEditorConfig
          models={props.imageLoraModels}
          modelConfigs={selectedLoraModelConfigs}
          onChangeModelConfigs={(configs) => {
            setSelectedLoraModelConfigs(configs)
          }}
          size={""}
          onChangeSize={(size) => {
            setImageSize(size)
          }}
          vae={0}
          onChangeVae={(vae) => {
            setImageVae(vae)
          }}
          seed={0}
          onChangeSeed={(seed) => {
            setImageSeed(seed)
          }}
        />
      }
      promptEditor={
        <GenerationEditorPrompt
          promptText={promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={setPromptText}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          promptText={negativePromptText}
          onChangePromptText={setNegativePromptText}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={onCreateTask}
          >
            {"生成する"}
          </Button>
          <GenerationEditorHistory
            selectHistory={selectHistory}
            selectedHistory={selectedHistory}
          />
        </div>
      }
    />
  )
}
