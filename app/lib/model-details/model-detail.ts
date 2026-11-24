/**
 * 生成機のモデルの紹介（Civitai・Hugging Face・公式の情報をもとに書いた文）
 * データは model-details.json（scripts/model-details/README.md の手順で作る）
 */
export type ModelDetailText = {
  /** 2〜4 文の紹介 */
  summary: string
  /** 短い特徴 */
  features: string[]
  /** 推奨設定・プロンプトのコツ（元の情報に書いてあるものだけ） */
  tips: string[]
}

export type ModelDetail = {
  /** generator_parameters.id（imageModels の id） */
  generatorId: number
  /** 紹介文のもとにした情報 */
  source: {
    kind: "civitai" | "huggingface" | "official" | "aipictors"
    url: string | null
    label: string
  }
  links: { label: string; url: string }[]
  creator: string | null
  baseModel: string | null
  license: string | null
  versionName: string | null
  /** YYYY-MM-DD */
  publishedAt: string | null
  triggerWords: string[]
  ja: ModelDetailText
  en: ModelDetailText
}
