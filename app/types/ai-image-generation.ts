// AI画像生成とサイズの型定義
export type AiImageSize =
  | "512x512"
  | "768x768"
  | "1024x1024"
  | "1280x720"
  | "720x1280"

export type CreateAiImageGenerationTaskInput = {
  prompt: string
  imageBase64?: string | null
  imageUrl?: string | null
  mimeType?: string | null
  size: AiImageSize
  isModification?: boolean | null
}
