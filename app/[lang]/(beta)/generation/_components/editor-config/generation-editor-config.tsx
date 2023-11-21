"use client"

import type { ImageLoraModelsQuery } from "@/__generated__/apollo"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-lora-models"
import { GenerationEditorConfigSampler } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-sampler"
import { GenerationEditorConfigScale } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-step"
import { GenerationEditorConfigVae } from "@/app/[lang]/(beta)/generation/_components/editor-config/generation-editor-config-vae"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"

type Props = {
  /**
   * 全てのモデル
   */
  models: ImageLoraModelsQuery["imageLoraModels"]
  /**
   * モデルの設定
   */
  modelConfigs: { id: string; value: number }[]
  /**
   * 設定を変更する
   * @param configs 設定
   */
  onChangeModelConfigs(configs: { id: string; value: number }[]): void
  /**
   * サイズ
   */
  size: string
  onChangeSize(size: string): void
  /**
   * VAE
   */
  vae: string
  onChangeVae(vae: string): void
  /**
   * シード値
   */
  seed: number
  onChangeSeed(seed: number): void
  scale: number
  onChangeScale(scale: number): void
  sampler: string
  onChangeSampler(sampler: string): void
}

export const GenerationEditorConfig = (props: Props) => {
  return (
    <GenerationEditorCard
      title={"加工（LoRA）"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <div className="overflow-y-auto">
        <div className="flex flex-col px-2 gap-y-4 pb-2">
          <GenerationEditorConfigLoraModels
            models={props.models}
            modelConfigs={props.modelConfigs}
            onChangeModelConfigs={props.onChangeModelConfigs}
          />
          <GenerationEditorConfigScale
            value={props.scale}
            onChange={props.onChangeScale}
          />
          <GenerationEditorConfigSeed
            value={props.seed}
            onChange={props.onChangeSeed}
          />
          <GenerationEditorConfigSize
            value={props.size}
            onChange={props.onChangeSize}
          />
          <GenerationEditorConfigStep
            value={props.scale}
            onChange={props.onChangeScale}
          />
          <GenerationEditorConfigVae
            value={props.vae}
            onChange={props.onChangeVae}
          />
          <GenerationEditorConfigSampler
            value={props.sampler}
            onChange={props.onChangeSampler}
          />
        </div>
      </div>
    </GenerationEditorCard>
  )
}
