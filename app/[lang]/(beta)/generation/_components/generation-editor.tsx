"use client"

import { GenerationEditorConfig } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config"
import { GenerationEditorLayout } from "@/app/[lang]/(beta)/generation/_components/generation-editor-layout"
import { GenerationEditorModels } from "@/app/[lang]/(beta)/generation/_components/generation-editor-models"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-prompt"
import { GenerationEditorResult } from "@/app/[lang]/(beta)/generation/_components/generation-editor-result"
import { useImageGenerationMachine } from "@/app/[lang]/(beta)/generation/_hooks/use-image-generation-machine"
import { toLoraPrompt } from "@/app/[lang]/(beta)/generation/_utils/to-lora-prompt"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Config } from "@/config"
import {
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/image-generation/image-generation-tasks"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { skipToken, useMutation, useSuspenseQuery } from "@apollo/client"
import { Suspense, startTransition, useContext, useMemo } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
}

export const GenerationEditor: React.FC<Props> = (props) => {
  const authContext = useContext(AuthContext)

  // const imageGenerationState = ImageGenerationContext.useSelector((state) => {
  //   return state.context
  // })

  // const imageGenerationRef = ImageGenerationContext.useActorRef()

  const { data: viewer } = useSuspenseQuery(viewerCurrentPassQuery, {})

  const { data, refetch } = useSuspenseQuery(
    viewerImageGenerationTasksQuery,
    authContext.isLoggedIn
      ? {
          variables: {
            limit: 64,
            offset: 0,
          },
        }
      : skipToken,
  )

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  const [createTask, { loading: isLoading }] = useMutation(
    createImageGenerationTaskMutation,
  )

  const userNanoid = viewer.viewer?.user.nanoid ?? null

  // const editorConfig = useEditorConfig({
  //   passType: passType,
  //   loraModels: props.imageLoraModels,
  // })

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
    if (userNanoid === null) {
      toast("ログインしてください")
      return
    }

    try {
      const formData = new FormData()
      formData.append("id", userNanoid)
      const response = await fetch(Config.wordpressWWW4Endpoint, {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        toast("通信エラーが発生しました、再度お試し下さい")
        return
      }
      const model = props.imageModels.find((model) => {
        return model.id === machine.state.context.modelId
      })
      if (typeof model === "undefined") {
        throw new Error("モデルが見つかりません")
      }
      const loraPromptTexts = machine.state.context.loraModels.map((config) => {
        const model = props.imageLoraModels.find((model) => {
          return model.id === config.modelId
        })
        if (model === undefined) return null
        return toLoraPrompt(model.name, config.value)
      })
      const promptTexts = [machine.state.context.promptText, ...loraPromptTexts]
      const promptText = promptTexts.join(" ")
      await createTask({
        variables: {
          input: {
            count: 1,
            model: model.name,
            vae: machine.state.context.vae ?? "",
            prompt: promptText,
            negativePrompt: machine.state.context.negativePromptText,
            seed: machine.state.context.seed,
            steps: machine.state.context.steps,
            scale: machine.state.context.scale,
            sampler: machine.state.context.sampler,
            sizeType: machine.state.context.sizeType as ImageGenerationSizeType,
            type: "TEXT_TO_IMAGE",
          },
        },
      })
      startTransition(() => {
        refetch()
      })
      toast("タスクを作成しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const selectedModel = props.imageModels.find((model) => {
    return model.id === machine.state.context.modelId
  })

  return (
    <GenerationEditorLayout
      models={
        <GenerationEditorModels
          models={props.imageModels}
          selectedModelId={machine.state.context.modelId}
          onSelectModelId={machine.updateModelId}
        />
      }
      loraModels={
        <GenerationEditorConfig
          loraModels={props.imageLoraModels}
          configLoraModels={machine.state.context.loraModels}
          configModelType={selectedModel?.type ?? "SD1"}
          configSampler={machine.state.context.sampler}
          configScale={machine.state.context.scale}
          configSeed={machine.state.context.seed}
          configSize={machine.state.context.sizeType}
          configVae={machine.state.context.vae}
          onAddLoraModelConfigs={machine.addLoraModel}
          onChangeSampler={machine.updateSampler}
          onChangeScale={machine.updateScale}
          onChangeSeed={machine.updateSeed}
          onChangeSize={machine.updateSizeType}
          onChangeVae={machine.updateVae}
          onUpdateLoraModelConfig={machine.updateLoraModel}
        />
      }
      promptEditor={
        <GenerationEditorPrompt
          promptText={machine.state.context.promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={machine.updatePrompt}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePrompt
          promptText={machine.state.context.negativePromptText}
          onChangePromptText={machine.updateNegativePrompt}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <Button
            className="w-full"
            disabled={
              isLoading || inProgress || machine.state.context.isDisabled
            }
            onClick={onCreateTask}
          >
            {isLoading || inProgress ? "生成中.." : "生成する"}
          </Button>
          <Suspense fallback={null}>
            <GenerationEditorResult
              tasks={data?.viewer?.imageGenerationTasks ?? []}
              onChangeSampler={machine.updateSampler}
              onChangeScale={machine.updateScale}
              onChangeSeed={machine.updateSeed}
              onChangeSize={machine.updateSizeType}
              onChangeVae={machine.updateVae}
              onChangePromptText={machine.updatePrompt}
              onChangeNegativePromptText={machine.updateNegativePrompt}
            />
          </Suspense>
        </div>
      }
    />
  )
}
