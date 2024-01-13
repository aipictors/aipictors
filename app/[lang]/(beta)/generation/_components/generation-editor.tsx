"use client"

import {
  CreateImageGenerationTaskDocument,
  CreateImageGenerationTaskMutationResult,
  CreateImageGenerationTaskMutationVariables,
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
  ViewerCurrentPassDocument,
  ViewerCurrentPassQuery,
  ViewerCurrentPassQueryVariables,
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
import { toLoraPrompt } from "@/app/[lang]/(beta)/generation/_utils/to-lora-prompt"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { skipToken, useMutation, useSuspenseQuery } from "@apollo/client"
import { Suspense, startTransition, useContext, useMemo } from "react"
import { useInterval } from "usehooks-ts"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
}

export const GenerationEditor: React.FC<Props> = (props) => {
  const appContext = useContext(AuthContext)

  const { data: viewer } = useSuspenseQuery<
    ViewerCurrentPassQuery,
    ViewerCurrentPassQueryVariables
  >(ViewerCurrentPassDocument, {})

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

  const passType = viewer.viewer?.currentPass?.type ?? null

  const editorConfig = useEditorConfig({
    passType: passType,
    loraModels: props.imageLoraModels,
  })

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
      const loraPromptTexts = editorConfig.loraModels.map((config) => {
        const model = props.imageLoraModels.find((model) => {
          return model.id === config.modelId
        })
        if (model === undefined) return null
        return toLoraPrompt(model.name, config.value)
      })
      const promptTexts = [editorConfig.promptText, ...loraPromptTexts]
      const promptText = promptTexts.join(" ")
      await createTask({
        variables: {
          input: {
            count: 1,
            model: model.name,
            vae: editorConfig.vae ?? "",
            prompt: promptText,
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
          loraModels={props.imageLoraModels}
          configLoraModels={editorConfig.loraModels}
          configModelType={selectedModel?.type ?? "SD1"}
          configSampler={editorConfig.sampler}
          configScale={editorConfig.scale}
          configSeed={editorConfig.seed}
          configSize={editorConfig.sizeType}
          configVae={editorConfig.vae}
          onAddLoraModelConfigs={editorConfig.addLoraModel}
          onChangeSampler={editorConfig.updateSampler}
          onChangeScale={editorConfig.updateScale}
          onChangeSeed={editorConfig.updateSeed}
          onChangeSize={editorConfig.updateSizeType}
          onChangeVae={editorConfig.updateVae}
          onUpdateLoraModelConfig={editorConfig.updateLoraModel}
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
              onChangeSampler={editorConfig.updateSampler}
              onChangeScale={editorConfig.updateScale}
              onChangeSeed={editorConfig.updateSeed}
              onChangeSize={editorConfig.updateSizeType}
              onChangeVae={editorConfig.updateVae}
              onChangePromptText={editorConfig.updatePrompt}
              onChangeNegativePromptText={editorConfig.updateNegativePrompt}
            />
          </Suspense>
        </div>
      }
    />
  )
}
