"use client"

import { GenerationEditorConfigView } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-view"
import { GenerationEditorNegativePromptView } from "@/app/[lang]/generation/_components/editor-negative-prompt-view/generation-editor-negative-prompt-view"
import { GenerationEditorPromptView } from "@/app/[lang]/generation/_components/editor-prompt-view/generation-editor-prompt-view"
import { GenerationEditorSubmissionView } from "@/app/[lang]/generation/_components/editor-submission-view/generation-editor-submit-view"
import { GenerationEditorTaskListView } from "@/app/[lang]/generation/_components/editor-task-list-view-view/generation-editor-task-list-view"
import { GenerationEditorLayout } from "@/app/[lang]/generation/_components/generation-editor-layout"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { useImageGenerationMachine } from "@/app/[lang]/generation/_hooks/use-image-generation-machine"
import {
  ImageGenerationSizeType,
  ImageLoraModelsQuery,
  type ImageModelsQuery,
  type PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { createImageGenerationTaskMutation } from "@/graphql/mutations/create-image-generation-task"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationStatusQuery } from "@/graphql/queries/viewer/viewer-image-generation-status"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation, useQuery, useSuspenseQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type Props = {
  imageModels: ImageModelsQuery["imageModels"]
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  termsMarkdownText: string
}

/**
 * @param props
 */
export function GenerationEditor(props: Props) {
  const { data: viewer } = useSuspenseQuery(viewerCurrentPassQuery, {})

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  useEffect(() => {
    const userNanoid = viewer.viewer?.user.nanoid ?? null
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [])

  const hasSignedTerms =
    viewer.viewer?.user.hasSignedImageGenerationTerms ?? false

  return (
    <GenerationEditorLayout
      config={
        <GenerationEditorConfigView
          models={props.imageModels}
          currentModelId={machine.context.modelId}
          currentModelIds={machine.context.modelIds}
          onSelectModelId={machine.updateModelId}
          loraModels={props.imageLoraModels}
          configLoRAModels={machine.context.loraModels}
          configSampler={machine.context.sampler}
          configScale={machine.context.scale}
          configSeed={machine.context.seed}
          configSize={machine.context.sizeType}
          configVae={machine.context.vae}
          configSteps={machine.context.steps}
          configClipSkip={machine.context.clipSkip}
          availableLoraModelsCount={machine.context.availableLoraModelsCount}
          onChangeLoraModelConfigs={machine.changeLoraModel}
          onChangeSampler={machine.updateSampler}
          onChangeScale={machine.updateScale}
          onChangeSeed={machine.updateSeed}
          onChangeSize={machine.updateSizeType}
          onChangeClipSkip={machine.updateClipSkip}
          onChangeSteps={machine.updateSteps}
          onUpdateLoraModelConfig={machine.updateLoraModel}
        />
      }
      promptEditor={
        <GenerationEditorPromptView
          promptText={machine.context.promptText}
          promptCategories={props.promptCategories}
          onChangePromptText={machine.updatePrompt}
          onBlurPromptText={machine.initPromptWithLoraModel}
        />
      }
      negativePromptEditor={
        <GenerationEditorNegativePromptView
          promptText={machine.context.negativePromptText}
          onChangePromptText={machine.updateNegativePrompt}
        />
      }
      history={
        <div className="flex flex-col h-full gap-y-2">
          <GenerationEditorSubmissionView
            imageModels={props.imageModels}
            hasSignedTerms={hasSignedTerms}
            termsMarkdownText={props.termsMarkdownText}
            isDisabled={machine.context.isDisabled}
            userNanoid={viewer?.viewer?.user?.nanoid ?? null}
            passType={viewer.viewer?.currentPass?.type ?? null}
            modelId={machine.context.modelId}
            context={machine.context}
          />
          <GenerationEditorTaskListView
            passType={viewer.viewer?.currentPass?.type ?? null}
            userNanoid={viewer?.viewer?.user?.nanoid ?? null}
            onUpdateSettings={machine.updateSettings}
          />
        </div>
      }
    />
  )
}
