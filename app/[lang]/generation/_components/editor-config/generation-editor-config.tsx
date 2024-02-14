"use client"

import { ConfigModel } from "@/app/[lang]/generation/_components/config-model"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-lora-models"
import { GenerationEditorConfigSampler } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-step"
import { GenerationEditorConfigVae } from "@/app/[lang]/generation/_components/editor-config/generation-editor-config-vae"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { GenerationModelsButton } from "@/app/[lang]/generation/_components/generation-models-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
} from "@/graphql/__generated__/graphql"
import { useBoolean } from "usehooks-ts"

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
  const currentModels = props.currentModelIds.map((modelId) => {
    return props.models.find((model) => {
      return model.id === modelId
    })
  })

  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <GenerationEditorCard
      title={"設定"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <ScrollArea type="always">
        <div className="flex flex-col pl-2 pr-4 gap-y-4 pb-2">
          <div className="grid gap-y-2">
            {currentModels.map((model) => (
              <ConfigModel
                key={model?.id}
                imageURL={model?.thumbnailImageURL ?? ""}
                name={model?.displayName ?? ""}
                isSelected={model?.id === props.currentModelId}
                onClick={() => {
                  props.onSelectModelId(model!.id, model!.type)
                }}
              />
            ))}
            <GenerationModelsButton
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
              models={props.models}
              selectedModelId={props.currentModelId}
              onSelect={props.onSelectModelId}
            />
          </div>
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
