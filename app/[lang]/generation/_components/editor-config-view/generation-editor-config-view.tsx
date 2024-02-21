"use client"

import { GenerationEditorConfigClipSkip } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-clipskip"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-lora-models"
import { GenerationEditorConfigModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-models"
import { GenerationEditorConfigResetButton } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-reset-button"
import { GenerationEditorConfigSampler } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-step"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { useGenerationEditor } from "@/app/[lang]/generation/_hooks/use-generation-editor"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
} from "@/graphql/__generated__/graphql"

type Props = {
  /**
   * モデル
   */
  models: ImageModelsQuery["imageModels"]
  /**
   * Loraモデル
   */
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
}

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationEditorConfigView = (props: Props) => {
  const editor = useGenerationEditor()

  /**
   * 選択中のモデル
   */
  const currentModel = props.models.find((model) => {
    return model.id === editor.context.modelId
  })

  /**
   * モデルの種類
   * SD1など
   */
  const configModelType = currentModel?.type ?? "SD1"

  return (
    <GenerationEditorCard
      title={"設定"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <ScrollArea type="always">
        <div className="flex flex-col px-4 gap-y-4 pb-4">
          <GenerationEditorConfigModels
            models={props.models}
            currentModelId={editor.context.modelId}
            currentModelIds={editor.context.modelIds}
            onSelectModelId={editor.updateModelId}
          />
          <Separator />
          <GenerationEditorConfigLoraModels
            models={props.loraModels}
            loraModels={editor.context.loraModels}
            availableLoraModelsCount={editor.context.availableLoraModelsCount}
            onChangeLoraModel={editor.changeLoraModel}
            onUpdateLoraModel={editor.updateLoraModel}
          />
          <Separator />
          <GenerationEditorConfigSize
            modelType={configModelType}
            value={editor.context.sizeType}
            onChange={editor.updateSizeType}
          />
          <GenerationEditorConfigScale
            value={editor.context.scale}
            onChange={editor.updateScale}
          />
          <GenerationEditorConfigSeed
            value={editor.context.seed}
            onChange={editor.updateSeed}
          />
          <GenerationEditorConfigStep
            value={editor.context.steps}
            onChange={editor.updateSteps}
          />
          <GenerationEditorConfigSampler
            value={editor.context.sampler}
            onChange={editor.updateSampler}
          />
          <GenerationEditorConfigClipSkip
            value={editor.context.clipSkip}
            onChange={editor.updateClipSkip}
          />
          <GenerationEditorConfigResetButton onReset={editor.reset} />
        </div>
      </ScrollArea>
    </GenerationEditorCard>
  )
}
