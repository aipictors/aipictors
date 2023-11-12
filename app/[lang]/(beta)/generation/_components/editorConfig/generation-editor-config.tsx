"use client"

import type { ImageLoraModelsQuery } from "@/__generated__/apollo"
import { GenerationEditorConfigLoraModels } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config-lora-models"
import { GenerationEditorConfigScale } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config-scale"
import { GenerationEditorConfigSeed } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config-seed"
import { GenerationEditorConfigSize } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config-size"
import { GenerationEditorConfigStep } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config-step"
import { GenerationEditorConfigVae } from "@/app/[lang]/(beta)/generation/_components/editorConfig/generation-editor-config-vae"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { Box, Stack } from "@chakra-ui/react"

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
  vae: number
  onChangeVae(vae: number): void
  /**
   * シード値
   */
  seed: number
  onChangeSeed(seed: number): void
}

export const GenerationEditorConfig: React.FC<Props> = (props) => {
  return (
    <GenerationEditorCard
      title={"加工（LoRA）"}
      tooltip={"イラストの絵柄を調整することができます。"}
    >
      <Box overflowY={"auto"}>
        <Stack p={2} spacing={4}>
          <GenerationEditorConfigLoraModels
            models={props.models}
            modelConfigs={props.modelConfigs}
            onChangeModelConfigs={props.onChangeModelConfigs}
          />
          <GenerationEditorConfigScale />
          <GenerationEditorConfigSeed />
          <GenerationEditorConfigSize />
          <GenerationEditorConfigStep />
          <GenerationEditorConfigVae />
        </Stack>
      </Box>
    </GenerationEditorCard>
  )
}
