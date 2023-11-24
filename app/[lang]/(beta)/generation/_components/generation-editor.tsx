"use client"

import {
  CreateImageGenerationTaskDocument,
  CreateImageGenerationTaskMutationResult,
  CreateImageGenerationTaskMutationVariables,
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "@/__generated__/apollo"
import { GenerationEditorConfig } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config"
import { GenerationEditorHistory } from "@/app/[lang]/(beta)/generation/_components/generation-editor-history"
import { GenerationEditorLayout } from "@/app/[lang]/(beta)/generation/_components/generation-editor-layout"
import { GenerationEditorModels } from "@/app/[lang]/(beta)/generation/_components/generation-editor-models"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-prompt"
import { useEditorConfig } from "@/app/[lang]/(beta)/generation/_hooks/use-editor-config"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Config } from "@/config"
import { skipToken, useMutation, useSuspenseQuery } from "@apollo/client"
import { Suspense, startTransition, useContext, useMemo, useState } from "react"
import { useInterval } from "usehooks-ts"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
}

export const GenerationEditor: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  const { data, refetch } = useSuspenseQuery<
    ViewerImageGenerationTasksQuery,
    ViewerImageGenerationTasksQueryVariables
  >(
    ViewerImageGenerationTasksDocument,
    appContext.isLoggedIn
      ? {
          variables: {
            limit: 64,
            offset: 0,
          },
        }
      : skipToken,
  )

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

  const inProgress = useMemo(() => {
    const index = data?.viewer?.imageGenerationTasks.findIndex((task) => {
      return task.status === "IN_PROGRESS"
    })
    return index !== -1
  }, [data?.viewer?.imageGenerationTasks])

  useInterval(
    () => {
      startTransition(() => {
        refetch()
      })
    },
    inProgress ? 2000 : 4000,
  )

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
      await createTask({
        variables: {
          input: {
            count: 1,
            model: model.name,
            vae: editorConfig.vae,
            prompt: inputPrompt,
            negativePrompt: editorConfig.negativePromptText,
            seed: editorConfig.seed,
            steps: editorConfig.steps,
            scale: editorConfig.scale,
            sampler: editorConfig.sampler,
            sizeType: editorConfig.sizeType as ImageGenerationSizeType,
            type: "TEXT_TO_IMAGE",
          },
        },
      })
      startTransition(() => {
        refetch()
      })
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
            disabled={isLoading || inProgress || editorConfig.isDisabled}
            onClick={onCreateTask}
          >
            {isLoading || inProgress ? "生成中.." : "生成する"}
          </Button>
          <Suspense fallback={null}>
            <GenerationEditorHistory
              tasks={data?.viewer?.imageGenerationTasks ?? []}
              selectHistory={selectHistory}
              selectedHistory={selectedHistory}
            />
          </Suspense>
        </div>
      }
    />
  )
}
