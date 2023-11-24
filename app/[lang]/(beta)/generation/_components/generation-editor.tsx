"use client"

import {
  CreateImageGenerationTaskDocument,
  CreateImageGenerationTaskMutationResult,
  CreateImageGenerationTaskMutationVariables,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/__generated__/apollo"
import { GenerationEditorConfig } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config"
import { GenerationEditorHistory } from "@/app/[lang]/(beta)/generation/_components/generation-editor-history"
import { GenerationEditorLayout } from "@/app/[lang]/(beta)/generation/_components/generation-editor-layout"
import { GenerationEditorModels } from "@/app/[lang]/(beta)/generation/_components/generation-editor-models"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-prompt"
import { useEditorConfig } from "@/app/[lang]/(beta)/generation/_hooks/use-editor-config"
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
   * 選択されたLoRAモデルのID
   */
  const [loraModelConfigs, setLoraModelConfigs] = useState(() => {
    return Config.defaultImageLoraModelIds.map((id) => {
      return { id, value: 0 }
    })
  })

  const editorConfig = useEditorConfig()

  const [selectedHistory, selectHistory] = useState("")

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    try {
      const model = props.imageModels.find((model) => {
        return model.id === editorConfig.modelId
      })
      if (typeof model === "undefined") {
        throw new Error("モデルが見つかりません")
      }
      const inputPrompt = editorConfig.promptText
      console.log({
        count: 1,
        model: model.name,
        vae: editorConfig.vae,
        prompt: inputPrompt,
        negativePrompt: "EasyNegative, nsfw, nude, ",
        seed: editorConfig.seed,
        steps: editorConfig.steps,
        scale: editorConfig.scale,
        sampler: editorConfig.sampler,
        sizeType: "SD1_512_768",
        type: "TEXT_TO_IMAGE",
      })
      // await createTask({
      //   variables: {
      //     input: {
      //       count: 1,
      //       model: model.name,
      //       vae: editorConfig.vae,
      //       prompt: inputPrompt,
      //       negativePrompt: "EasyNegative, nsfw, nude, ",
      //       seed: editorConfig.seed,
      //       steps: editorConfig.steps,
      //       scale: editorConfig.scale,
      //       sampler: editorConfig.sampler,
      //       sizeType: "SD1_512_768",
      //       type: "TEXT_TO_IMAGE",
      //     },
      //   },
      // })
      toast({ description: "タスクを作成しました" })
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message })
      }
    }
  }

  const selectedModel = props.imageModels.find((model) => {
    return model.id === editorConfig.modelId
  })

  return (
    <GenerationEditorLayout
      models={
        <GenerationEditorModels
          models={props.imageModels}
          selectedModelId={editorConfig.modelId}
          onSelectModelId={(id) => {
            editorConfig.updateModelId(id)
          }}
        />
      }
      loraModels={
        <GenerationEditorConfig
          modelType={selectedModel?.type ?? "SD1"}
          loraModels={props.imageLoraModels}
          modelConfigs={loraModelConfigs}
          onChangeModelConfigs={setLoraModelConfigs}
          size={editorConfig.sizeType}
          onChangeSize={editorConfig.updateSizeType}
          vae={editorConfig.vae}
          onChangeVae={editorConfig.updateVae}
          seed={editorConfig.seed}
          onChangeSeed={editorConfig.updateSeed}
          scale={editorConfig.scale}
          onChangeScale={editorConfig.updateScale}
          sampler={editorConfig.sampler}
          onChangeSampler={editorConfig.updateSampler}
        />
      }
      promptEditor={
        <GenerationEditorPrompt
          promptText={editorConfig.promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={editorConfig.updatePrompt}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          promptText={editorConfig.negativePromptText}
          onChangePromptText={editorConfig.updateNegativePrompt}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <Button
            className="w-full"
            disabled={isLoading || editorConfig.isDisabled}
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
