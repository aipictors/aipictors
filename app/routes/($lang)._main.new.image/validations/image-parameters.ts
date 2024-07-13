import { nullable, object, string } from "valibot"

/**
 * 生成画像の生成情報
 */
export const vImageParameters = object({
  prompt: nullable(string()),
  negativePrompt: nullable(string()),
  seed: nullable(string()),
  steps: nullable(string()),
  strength: nullable(string()),
  noise: nullable(string()),
  scale: nullable(string()),
  sampler: nullable(string()),
  vae: nullable(string()),
  modelHash: nullable(string()),
  model: nullable(string()),
})
