/**
 * 画像生成のサンプラー・Schedule type・CFG の選択肢と、初心者向けの説明。
 * バックエンド（aipictors-system lib/generation-sampler.ts）と同じ一覧にしておく（違う値は既定に置き換えられる）
 */

type GenerationSamplerOption = {
  value: string
  /**
   * 選択肢の下に出すひとこと
   */
  description: string
  descriptionEn: string
}

const DEFAULT_GENERATION_SAMPLER = "DPM++ 2M"

export const GENERATION_SAMPLER_OPTIONS: GenerationSamplerOption[] = [
  {
    value: "DPM++ 2M",
    description: "標準。速くてきれい。迷ったらこれ",
    descriptionEn: "Default. Fast and clean. Pick this if unsure",
  },
  {
    value: "Euler a",
    description: "やわらかい絵柄。同じ Seed でも毎回少し変わる",
    descriptionEn: "Soft look. Varies a little even with the same seed",
  },
  {
    value: "DPM++ 2M SDE",
    description: "描き込みが細かい。少しランダム",
    descriptionEn: "Fine detail. Slightly random",
  },
  {
    value: "ER SDE",
    description: "新しい描き方。Anima などのモデル向け",
    descriptionEn: "Newer sampler. For models such as Anima",
  },
  {
    value: "Euler",
    description: "シンプルで安定。turbo・lightning 系のモデルにも",
    descriptionEn: "Simple and stable. Also for turbo / lightning models",
  },
  {
    value: "DPM++ SDE",
    description: "細かいが少し時間がかかる",
    descriptionEn: "Detailed but a little slower",
  },
  {
    value: "DPM++ 2S a",
    description: "やわらかく細かい。少し時間がかかる",
    descriptionEn: "Soft and detailed. A little slower",
  },
  {
    value: "DDIM",
    description: "昔からある描き方",
    descriptionEn: "Classic sampler",
  },
  {
    value: "Heun",
    description: "ていねいだが時間がかかる",
    descriptionEn: "Careful but slower",
  },
  {
    value: "LMS",
    description: "昔からある描き方",
    descriptionEn: "Classic sampler",
  },
  {
    value: "DPM2",
    description: "昔からある描き方",
    descriptionEn: "Classic sampler",
  },
  {
    value: "DPM2 a",
    description: "昔からある描き方（ランダム寄り）",
    descriptionEn: "Classic sampler (more random)",
  },
]

type GenerationSchedulerOption = {
  /**
   * null は「自動」（サンプラーごとの既定）
   */
  value: string | null
  label: string
  labelEn: string
  description: string
  descriptionEn: string
}

export const GENERATION_SCHEDULER_OPTIONS: GenerationSchedulerOption[] = [
  {
    value: null,
    label: "自動（おすすめ）",
    labelEn: "Automatic (recommended)",
    description: "サンプラーに合うものを自動で選びます",
    descriptionEn: "Picks the one that suits the sampler",
  },
  {
    value: "Karras",
    label: "Karras",
    labelEn: "Karras",
    description: "定番。仕上がりがなめらか",
    descriptionEn: "The usual choice. Smooth finish",
  },
  {
    value: "Exponential",
    label: "Exponential",
    labelEn: "Exponential",
    description: "SDE 系のサンプラーと相性がよい",
    descriptionEn: "Works well with SDE samplers",
  },
  {
    value: "SGM Uniform",
    label: "SGM Uniform",
    labelEn: "SGM Uniform",
    description: "turbo・lightning 系のモデル向け",
    descriptionEn: "For turbo / lightning models",
  },
  {
    value: "Simple",
    label: "Simple",
    labelEn: "Simple",
    description: "ER SDE や新しいモデル向け",
    descriptionEn: "For ER SDE and newer models",
  },
  {
    value: "Normal",
    label: "Normal",
    labelEn: "Normal",
    description: "基本の減らし方",
    descriptionEn: "Basic schedule",
  },
  {
    value: "Beta",
    label: "Beta",
    labelEn: "Beta",
    description: "メリハリのある仕上がり",
    descriptionEn: "Crisper finish",
  },
]

const SCHEDULER_SUFFIXES = [
  "Karras",
  "Exponential",
  "SGM Uniform",
  "Simple",
  "Normal",
  "Beta",
]

const lower = (value: string) => value.trim().toLowerCase()

/**
 * 画面で選ぶサンプラー名にそろえる（「DPM++ 2M Karras」のような昔の名前は末尾を外す。生成結果は今までと同じ）
 */
export const toGenerationSamplerOptionValue = (
  value: string | null | undefined,
) => {
  let name = (value ?? "").trim()
  for (const suffix of SCHEDULER_SUFFIXES) {
    if (lower(name).endsWith(` ${lower(suffix)}`)) {
      name = name.slice(0, -suffix.length - 1).trim()
      break
    }
  }
  const found = GENERATION_SAMPLER_OPTIONS.find(
    (option) => lower(option.value) === lower(name),
  )
  return found?.value ?? DEFAULT_GENERATION_SAMPLER
}

/**
 * Schedule type をそろえる。知らない値は null（自動）
 */
export const toGenerationSchedulerValue = (
  value: string | null | undefined,
) => {
  if (!value) return null
  const found = GENERATION_SCHEDULER_OPTIONS.find(
    (option) => option.value !== null && lower(option.value) === lower(value),
  )
  return found?.value ?? null
}

export const MIN_GENERATION_SCALE = 1
export const MAX_GENERATION_SCALE = 15

/**
 * CFG がこれより小さいと、turbo・lightning 系でないモデルでは絵が崩れやすい
 */
export const LOW_GENERATION_SCALE = 4

export type GenerationSettingsPreset = {
  id: string
  label: string
  labelEn: string
  description: string
  descriptionEn: string
  scale: number
  steps: number
  sampler: string
  scheduler: string | null
}

export const GENERATION_SETTINGS_PRESETS: GenerationSettingsPreset[] = [
  {
    id: "standard",
    label: "標準",
    labelEn: "Standard",
    description: "ふつうのモデルはこれで大丈夫です",
    descriptionEn: "Fine for most models",
    scale: 7,
    steps: 20,
    sampler: DEFAULT_GENERATION_SAMPLER,
    scheduler: null,
  },
  {
    id: "turbo",
    label: "turbo・lightning 用",
    labelEn: "Turbo / lightning",
    description:
      "少ない回数で描く専用モデル（名前に turbo・lightning・DMD などが付くもの）向け",
    descriptionEn:
      "For few-step models (names with turbo, lightning, DMD, etc.)",
    scale: 1,
    steps: 8,
    sampler: "Euler",
    scheduler: "SGM Uniform",
  },
]

type GenerationRecommendedSettings = {
  sampler: string | null
  scheduler: string | null
  cfgScale: number | null
  steps: number | null
  clipSkip: number | null
}

/**
 * おすすめ設定を短い文にする（例: ER SDE・Simple・CFG 1・Steps 8）
 */
export const describeRecommendedSettings = (
  settings: GenerationRecommendedSettings,
) => {
  return [
    settings.sampler,
    settings.scheduler,
    settings.cfgScale !== null ? `CFG ${settings.cfgScale}` : null,
    settings.steps !== null ? `Steps ${settings.steps}` : null,
    settings.clipSkip !== null ? `Clip skip ${settings.clipSkip}` : null,
  ]
    .filter((v): v is string => v !== null && v !== "")
    .join("・")
}
