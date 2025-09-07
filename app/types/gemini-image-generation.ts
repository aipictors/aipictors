// AI画像生成とサイズの型定義
export type GeminiImageSize =
  | "LANDSCAPE"
  | "PORTRAIT"
  | "SQUARE_512"
  | "SQUARE_768"
  | "SQUARE_1024"

export type CreateGeminiImageGenerationTaskInput = {
  prompt: string
  imageBase64?: string | null
  imageUrl?: string | null
  mimeType?: string | null
  size: GeminiImageSize
}
