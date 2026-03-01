// AI画像生成とサイズの型定義
export type GeminiImageSize =
  | "LANDSCAPE"
  | "PORTRAIT"
  | "SQUARE_512"
  | "SQUARE_768"
  | "SQUARE_1024"

export type GeminiImageModel =
  | "GEMINI_25_FLASH_IMAGE"
  | "GEMINI_31_FLASH_IMAGE_PREVIEW"

export type CreateGeminiImageGenerationTaskInput = {
  prompt: string
  imageBase64?: string | null
  imageUrl?: string | null
  mimeType?: string | null
  model?: GeminiImageModel | null
  size: GeminiImageSize
}
