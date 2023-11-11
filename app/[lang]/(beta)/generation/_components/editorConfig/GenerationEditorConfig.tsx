"use client"

import { Box, Stack } from "@chakra-ui/react"
import type { ImageLoraModelsQuery } from "__generated__/apollo"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/GenerationEditorCard"
import { GenerationEditorConfigLoraModels } from "app/[lang]/(beta)/generation/_components/editorConfig/GenerationEditorConfigLoraModels"
import { GenerationEditorConfigScale } from "app/[lang]/(beta)/generation/_components/editorConfig/GenerationEditorConfigScale"
import { GenerationEditorConfigSeed } from "app/[lang]/(beta)/generation/_components/editorConfig/GenerationEditorConfigSeed"
import { GenerationEditorConfigSize } from "app/[lang]/(beta)/generation/_components/editorConfig/GenerationEditorConfigSize"
import { GenerationEditorConfigStep } from "app/[lang]/(beta)/generation/_components/editorConfig/GenerationEditorConfigStep"
import { GenerationEditorConfigVae } from "app/[lang]/(beta)/generation/_components/editorConfig/GenerationEditorConfigVae"

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
