/**
 * 公式 LoRA の紹介（Civitai で公開されている情報をもとに書いた文）
 * データは lora-details.json（scripts/lora-details/README.md の手順で作る）
 */
export type LoraDetailText = {
  /** 一覧や見出しに出す名前 */
  displayName: string
  /** 1〜2 文の短い説明 */
  description: string
  /** 2〜4 文の紹介 */
  summary: string
  /** 短い特徴 */
  features: string[]
  /** 使い方のコツ（元の情報に書いてあるものだけ） */
  tips: string[]
  /** 配布元の利用条件のうち、表示しておくもの */
  license: string
}

export type LoraDetail = {
  /** 生成機の LoRA の名前（generator_parameters.name。プロンプトでは <lora:name:強さ>） */
  name: string
  source: {
    kind: "civitai"
    url: string
    label: string
  }
  /** 配布元の作者 */
  creator: string | null
  /** 入れた版のベースモデル（Illustrious・NoobAI・SDXL 1.0） */
  baseModel: string
  versionName: string | null
  /** YYYY-MM-DD */
  publishedAt: string | null
  triggerWords: string[]
  /** 推奨の強さ。配布元に書いてあるときだけ min/max が入る */
  weight: { recommended: number; min: number | null; max: number | null }
  /** 作例（配布元の全年齢の画像。版権キャラなどしか無いものは Aipictors で生成した画像） */
  images: string[]
  /** 作例が Aipictors で生成した画像のとき true */
  imagesByAipictors: boolean
  ja: LoraDetailText
  en: LoraDetailText
}
