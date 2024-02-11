"use client"

import { GenerationEditorConfigLoraModels } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-lora-models"
import { GenerationEditorConfigSampler } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-step"
import { GenerationEditorConfigVae } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-vae"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ImageLoraModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
  configLoRAModels: string[]
  /**
   * モデルの種類
   * SD1など
   */
  configModelType: string
  configSampler: string
  configScale: number
  configSteps: number
  configSeed: number
  configSize: string
  configVae: string | null
  availableLoraModelsCount: number
  onChangeLoraModelConfigs(modelName: string): void
  onChangeSampler(sampler: string): void
  onChangeScale(scale: number): void
  onChangeSteps(steps: number): void
  onChangeSeed(seed: number): void
  onChangeSize(size: string): void
  onChangeVae(vae: string | null): void
  onUpdateLoraModelConfig(modelId: string, value: number): void
}

export const GenerationEditorConfig = (props: Props) => {
  return (
    <GenerationEditorCard
      title={"設定"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <ScrollArea>
        <div className="flex flex-col px-2 gap-y-4 pb-2">
          <GenerationEditorConfigLoraModels
            models={props.loraModels}
            loraModels={props.configLoRAModels}
            availableLoraModelsCount={props.availableLoraModelsCount}
            onChangeLoraModel={props.onChangeLoraModelConfigs}
            onUpdateLoraModel={props.onUpdateLoraModelConfig}
          />
          <GenerationEditorConfigSize
            modelType={props.configModelType}
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
          <GenerationEditorConfigVae
            value={props.configVae}
            onChange={props.onChangeVae}
          />
          <GenerationEditorConfigSampler
            value={props.configSampler}
            onChange={props.onChangeSampler}
          />
        </div>
      </ScrollArea>
    </GenerationEditorCard>
  )
}
