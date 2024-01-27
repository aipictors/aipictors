"use client"

import { GenerationTermsDialog } from "@/app/[lang]/(beta)/generation/_components/drawer/generation-terms-dialog"
import { GenerationEditorConfig } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config"
import { GenerationEditorLayout } from "@/app/[lang]/(beta)/generation/_components/generation-editor-layout"
import { GenerationEditorModels } from "@/app/[lang]/(beta)/generation/_components/generation-editor-models"
import { GenerationEditorNegativePrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-negative-prompt"
import { GenerationEditorPrompt } from "@/app/[lang]/(beta)/generation/_components/generation-editor-prompt"
import { GenerationEditorResult } from "@/app/[lang]/(beta)/generation/_components/generation-editor-result"
import { useImageGenerationMachine } from "@/app/[lang]/(beta)/generation/_hooks/use-image-generation-machine"
import { activeImageGeneration } from "@/app/[lang]/(beta)/generation/_utils/active-image-generation"
import { toLoraPromptTexts } from "@/app/[lang]/(beta)/generation/_utils/to-lora-prompt-texts"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { signImageGenerationTermsMutation } from "@/graphql/mutations/sign-image-generation-terms"
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
  termsMarkdownText: string
}

export const GenerationEditor: React.FC<Props> = (props) => {
  const authContext = useContext(AuthContext)

  // const imageGenerationState = ImageGenerationContext.useSelector((state) => {
  //   return state.context
  // })

  // const imageGenerationRef = ImageGenerationContext.useActorRef()

  const { data: viewer, refetch: refetchViewer } = useSuspenseQuery(
    viewerCurrentPassQuery,
    {},
  )

  const { data, refetch } = useSuspenseQuery(
    viewerImageGenerationTasksQuery,
    authContext.isLoggedIn
      ? { variables: { limit: 64, offset: 0 } }
      : skipToken,
  )

  const [signTerms] = useMutation(signImageGenerationTermsMutation)

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  const [createTask, { loading }] = useMutation(
    createImageGenerationTaskMutation,
  )

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

  const onSignImageGenerationTerms = async () => {
    try {
      await signTerms({ variables: { input: { version: 1 } } })
      startTransition(() => {
        refetchViewer()
      })
      toast("画像生成の利用規約に同意しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const hasSignedTerms = viewer.viewer?.user.hasSignedImageGenerationTerms

  /**
   * タスクを作成する
   */
  const onCreateTask = async () => {
    if (!hasSignedTerms) return
    const userNanoid = viewer.viewer?.user.nanoid ?? null
    if (userNanoid === null) return
    try {
      await activeImageGeneration({ nanoid: userNanoid })
      const model = props.imageModels.find((model) => {
        return model.id === machine.state.context.modelId
      })
      if (typeof model === "undefined") return
      const loraPromptTexts = toLoraPromptTexts(
        props.imageLoraModels,
        machine.state.context.loraConfigs,
      )
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

  const currentModel = props.imageModels.find((model) => {
    return model.id === machine.state.context.modelId
  })

  return (
    <GenerationEditorLayout
      config={
        <div className="grid gap-y-2 h-full">
          <GenerationEditorModels
            models={props.imageModels}
            currentModelId={machine.state.context.modelId}
            onSelectModelId={machine.updateModelId}
          />
          <GenerationEditorConfig
            loraModels={props.imageLoraModels}
            configLoraModels={machine.state.context.loraConfigs}
            configModelType={currentModel?.type ?? "SD1"}
            configSampler={machine.state.context.sampler}
            configScale={machine.state.context.scale}
            configSeed={machine.state.context.seed}
            configSize={machine.state.context.sizeType}
            configVae={machine.state.context.vae}
            availableLoraModelsCount={
              machine.state.context.availableLoraModelsCount
            }
            onAddLoraModelConfigs={machine.addLoraConfig}
            onChangeSampler={machine.updateSampler}
            onChangeScale={machine.updateScale}
            onChangeSeed={machine.updateSeed}
            onChangeSize={machine.updateSizeType}
            onChangeVae={machine.updateVae}
            onUpdateLoraModelConfig={machine.updateLoraModel}
          />
        </div>
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
          <div>
            <GenerationTermsDialog
              termsMarkdownText={props.termsMarkdownText}
              isDisabled={hasSignedTerms}
              onSubmit={onSignImageGenerationTerms}
            >
              <Button
                className="w-full"
                size={"lg"}
                disabled={
                  loading || inProgress || machine.state.context.isDisabled
                }
                onClick={hasSignedTerms ? onCreateTask : undefined}
              >
                {loading || inProgress ? "生成中.." : "生成する"}
              </Button>
            </GenerationTermsDialog>
          </div>
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
