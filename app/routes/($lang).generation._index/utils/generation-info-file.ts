/**
 * 生成情報（プロンプトや設定）のファイル。画像は含めない。
 * 人が読めるように整形した JSON で書き出し、読み込むと同じ設定で生成画面に戻せる
 */

export const GENERATION_INFO_FORMAT = "aipictors-generation-info"

export type GenerationInfoEntry = {
  /** 生成した日時（ISO 8601） */
  createdAt: string | null
  model: { id: string; name: string; type: string }
  prompt: string
  negativePrompt: string
  seed: number
  steps: number
  scale: number
  sampler: string
  scheduler: string | null
  clipSkip: number
  vae: string | null
  sizeType: string
  width: number | null
  height: number | null
  generationType: string | null
}

/** 履歴の 1 件（GraphQL の結果）から必要な項目だけ取り出す */
export type GenerationInfoSource = {
  completedAt?: number | null
  model?: { id: string; name?: string | null; type?: string | null } | null
  prompt?: string | null
  negativePrompt?: string | null
  seed?: number | null
  steps?: number | null
  scale?: number | null
  sampler?: string | null
  scheduler?: string | null
  clipSkip?: number | null
  vae?: string | null
  sizeType?: string | null
  width?: number | null
  height?: number | null
  generationType?: string | null
}

export function toGenerationInfoEntry(
  source: GenerationInfoSource,
): GenerationInfoEntry | null {
  if (!source.model?.id) return null
  return {
    createdAt: source.completedAt
      ? new Date(source.completedAt * 1000).toISOString()
      : null,
    model: {
      id: source.model.id,
      name: source.model.name ?? "",
      type: source.model.type ?? "",
    },
    prompt: source.prompt ?? "",
    negativePrompt: source.negativePrompt ?? "",
    seed: source.seed ?? -1,
    steps: source.steps ?? 20,
    scale: source.scale ?? 7,
    sampler: source.sampler ?? "",
    scheduler: source.scheduler ?? null,
    clipSkip: source.clipSkip ?? 2,
    vae: source.vae ?? null,
    sizeType: source.sizeType ?? "",
    width: source.width ?? null,
    height: source.height ?? null,
    generationType: source.generationType ?? null,
  }
}

export function toGenerationInfoFileText(
  entries: GenerationInfoEntry[],
  now = new Date(),
): string {
  return `${JSON.stringify(
    {
      format: GENERATION_INFO_FORMAT,
      version: 1,
      exportedAt: now.toISOString(),
      count: entries.length,
      items: entries,
    },
    null,
    2,
  )}\n`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback

const num = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback

/**
 * 書き出したファイルを読む。形が違う項目は飛ばし、1 件も読めなければエラー
 */
export function parseGenerationInfoFile(text: string): GenerationInfoEntry[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("生成情報のファイルとして読めませんでした")
  }
  const items =
    isRecord(data) && Array.isArray(data.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : null
  if (items === null) {
    throw new Error("生成情報のファイルとして読めませんでした")
  }
  const entries = items.flatMap((item): GenerationInfoEntry[] => {
    if (!isRecord(item) || !isRecord(item.model)) return []
    const modelId = str(item.model.id)
    if (modelId === "") return []
    return [
      {
        createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
        model: {
          id: modelId,
          name: str(item.model.name),
          type: str(item.model.type),
        },
        prompt: str(item.prompt),
        negativePrompt: str(item.negativePrompt),
        seed: num(item.seed, -1),
        steps: num(item.steps, 20),
        scale: num(item.scale, 7),
        sampler: str(item.sampler),
        scheduler: typeof item.scheduler === "string" ? item.scheduler : null,
        clipSkip: num(item.clipSkip, 2),
        vae: typeof item.vae === "string" ? item.vae : null,
        sizeType: str(item.sizeType),
        width: typeof item.width === "number" ? item.width : null,
        height: typeof item.height === "number" ? item.height : null,
        generationType:
          typeof item.generationType === "string" ? item.generationType : null,
      },
    ]
  })
  if (entries.length === 0) {
    throw new Error("読み込める生成情報がありませんでした")
  }
  return entries
}

export function toGenerationInfoFileName(now = new Date()): string {
  const jst = new Date(now.getTime() + 9 * 3600 * 1000)
  const stamp = jst
    .toISOString()
    .slice(0, 16)
    .replace(/[-:]/g, "")
    .replace("T", "-")
  return `aipictors-generation-info-${stamp}.json`
}
