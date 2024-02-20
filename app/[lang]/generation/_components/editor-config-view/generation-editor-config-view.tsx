"use client"

import { GenerationEditorConfigClipSkip } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-clipskip"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-lora-models"
import { GenerationEditorConfigModels } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-models"
import { GenerationEditorConfigSampler } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/generation/_components/editor-config-view/generation-editor-config-step"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
} from "@/graphql/__generated__/graphql"

type Props = {
  models: ImageModelsQuery["imageModels"]
  currentModelId: string
  /**
   * 表示されるモデルのID（最大3個）
   */
  currentModelIds: string[]
  onSelectModelId(id: string, type: string): void
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
  configLoRAModels: string[]
  configSampler: string
  configScale: number
  configSteps: number
  configSeed: number
  configSize: string
  configVae: string | null
  configClipSkip: number
  availableLoraModelsCount: number
  onChangeLoraModelConfigs(modelName: string): void
  onChangeSampler(sampler: string): void
  onChangeScale(scale: number): void
  onChangeSteps(steps: number): void
  onChangeClipSkip(clipSkip: number): void
  onChangeSeed(seed: number): void
  onChangeSize(size: string): void
  onUpdateLoraModelConfig(modelId: string, value: number): void
}

/**
 * エディタの設定
 * @param props
 * @returns
 */
export const GenerationEditorConfigView = (props: Props) => {
  /**
   * 選択中のモデル
   */
  const currentModel = props.models.find((model) => {
    return model.id === props.currentModelId
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
            currentModelId={props.currentModelId}
            currentModelIds={props.currentModelIds}
            onSelectModelId={props.onSelectModelId}
          />
          <Separator />
          <GenerationEditorConfigLoraModels
            models={props.loraModels}
            loraModels={props.configLoRAModels}
            availableLoraModelsCount={props.availableLoraModelsCount}
            onChangeLoraModel={props.onChangeLoraModelConfigs}
            onUpdateLoraModel={props.onUpdateLoraModelConfig}
          />
          <Separator />
          <GenerationEditorConfigSize
            modelType={configModelType}
            value={props.configSize}
            onChange={props.onChangeSize}
          />
          <GenerationEditorConfigScale
            value={props.configScale}
            onChange={props.onChangeScale}
          />
          <GenerationEditorConfigSeed
            value={props.configSeed}
            onChange={props.onChangeSeed}
          />
          <GenerationEditorConfigStep
            value={props.configSteps}
            onChange={props.onChangeSteps}
          />
          <GenerationEditorConfigSampler
            value={props.configSampler}
            onChange={props.onChangeSampler}
          />
          <GenerationEditorConfigClipSkip
            value={props.configClipSkip}
            onChange={props.onChangeClipSkip}
          />
        </div>
      </ScrollArea>
    </GenerationEditorCard>
  )
}
