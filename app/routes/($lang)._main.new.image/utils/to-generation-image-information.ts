import type { PNGInfo } from "~/utils/get-extract-info-from-png"

export type GenerationResultParams = {
  prompt: string
  negativePrompt: string
  seed?: number | string | null
  steps?: number | string | null
  scale?: number | string | null
  sampler?: string | null
  vae?: string | null
  modelHash?: string | null
  model?: { name: string } | null
}

const toText = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === "" ? null : String(value)

/**
 * 生成履歴の内容から投稿の生成情報を作る。
 * 生成サーバーによっては PNG に生成情報が入っていないので、PNG で読めた項目だけを上書きする
 */
export const toGenerationImageInformation = (
  result: GenerationResultParams,
  pngInfo: PNGInfo | null,
): PNGInfo => {
  const extracted = Object.fromEntries(
    Object.entries(pngInfo?.params ?? {}).filter(([, value]) => Boolean(value)),
  )
  return {
    src: pngInfo?.src ?? null,
    params: {
      seed: toText(result.seed),
      steps: toText(result.steps),
      strength: null,
      noise: null,
      scale: toText(result.scale),
      sampler: result.sampler ?? null,
      vae: result.vae ?? null,
      modelHash: result.modelHash ?? null,
      model: result.model?.name ?? null,
      ...extracted,
      prompt: result.prompt,
      negativePrompt: result.negativePrompt,
    },
  }
}
