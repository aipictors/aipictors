import type {
  UploadedPart,
  UserModelBaseModel,
  UserModelKind,
} from "~/lib/user-models/types"

/**
 * sha256 計算で一度に読むサイズ
 */
const HASH_READ_BYTES = 16 * 1024 * 1024

export type PartPlan = {
  partNumber: number
  start: number
  end: number
}

/**
 * ファイルを partSize ごとのパートに分ける（partNumber は 1 始まり）
 */
export const planParts = (sizeBytes: number, partSize: number): PartPlan[] => {
  if (sizeBytes <= 0 || partSize <= 0) return []
  const count = Math.ceil(sizeBytes / partSize)
  return Array.from({ length: count }, (_, index) => ({
    partNumber: index + 1,
    start: index * partSize,
    end: Math.min(sizeBytes, (index + 1) * partSize),
  }))
}

/**
 * ブラウザで巨大ファイルの sha256 を増分計算する（Web Crypto は全体をメモリに載せるため使わない）
 */
export const computeFileSha256 = async (
  file: Blob,
  options: {
    onProgress?(hashedBytes: number): void
    signal?: AbortSignal
  } = {},
): Promise<string> => {
  const { createSHA256 } = await import("hash-wasm")
  const hasher = await createSHA256()
  hasher.init()

  let offset = 0
  while (offset < file.size) {
    if (options.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }
    const end = Math.min(file.size, offset + HASH_READ_BYTES)
    const buffer = await file.slice(offset, end).arrayBuffer()
    hasher.update(new Uint8Array(buffer))
    offset = end
    options.onProgress?.(offset)
    // UI を固めないように 1 フレーム譲る
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  return hasher.digest("hex")
}

/**
 * 直近の送信速度から残り時間を出す
 */
export class TransferSpeedMeter {
  private samples: { time: number; bytes: number }[] = []

  constructor(private readonly windowMs = 8000) {}

  reset(): void {
    this.samples = []
  }

  push(bytes: number, time: number = Date.now()): void {
    this.samples.push({ time, bytes })
    const threshold = time - this.windowMs
    while (this.samples.length > 2 && this.samples[0].time < threshold) {
      this.samples.shift()
    }
  }

  get bytesPerSecond(): number {
    if (this.samples.length < 2) return 0
    const first = this.samples[0]
    const last = this.samples[this.samples.length - 1]
    const elapsed = (last.time - first.time) / 1000
    if (elapsed <= 0) return 0
    return Math.max(0, (last.bytes - first.bytes) / elapsed)
  }

  etaSeconds(remainingBytes: number): number | null {
    const speed = this.bytesPerSecond
    if (speed <= 0) return null
    return remainingBytes / speed
  }
}

export type SafetensorsInfo = {
  /**
   * 推定した種類（判定できなければ null）
   */
  kind: UserModelKind | null
  baseModel: UserModelBaseModel | null
  /**
   * 学習時のタグ頻度から推定したトリガーワード候補
   */
  triggerWords: string[]
  title: string | null
}

const toBaseModel = (text: string): UserModelBaseModel | null => {
  const value = text.toLowerCase()
  if (value.includes("pony")) return "PONY"
  if (value.includes("illustrious")) return "ILLUSTRIOUS"
  if (value.includes("noob")) return "NOOBAI"
  if (value.includes("sdxl") || value.includes("xl")) return "SDXL"
  if (
    value.includes("sd_v1") ||
    value.includes("sd1") ||
    value.includes("v1-5")
  )
    return "SD1.5"
  return null
}

/**
 * safetensors のヘッダー JSON を解析する（先頭 8 バイト = ヘッダー長 u64 LE）
 */
export const parseSafetensorsHeader = (
  headerJson: Record<string, unknown>,
): SafetensorsInfo => {
  const metadata = (headerJson.__metadata__ ?? {}) as Record<string, string>
  const keys = Object.keys(headerJson).filter((key) => key !== "__metadata__")

  const isLora =
    keys.some(
      (key) =>
        key.startsWith("lora_") ||
        key.includes(".lora_down") ||
        key.includes(".lora_up") ||
        key.includes("lora_A") ||
        key.includes("hada_w1") ||
        key.includes("lokr_w1"),
    ) || typeof metadata.ss_network_module === "string"

  const isCheckpoint =
    !isLora &&
    keys.some(
      (key) =>
        key.startsWith("model.diffusion_model.") ||
        key.startsWith("first_stage_model."),
    )

  const kind: UserModelKind | null = isLora
    ? "LORA"
    : isCheckpoint
      ? "CHECKPOINT"
      : null

  const baseModel = (() => {
    const candidates = [
      metadata["modelspec.architecture"],
      metadata.ss_base_model_version,
      metadata.ss_sd_model_name,
    ].filter((value): value is string => typeof value === "string")
    for (const candidate of candidates) {
      const resolved = toBaseModel(candidate)
      if (resolved) return resolved
    }
    if (
      keys.some((key) => key.startsWith("conditioner.embedders.1.")) ||
      keys.some((key) => key.startsWith("lora_te2_"))
    ) {
      return "SDXL" as const
    }
    if (keys.some((key) => key.startsWith("cond_stage_model."))) {
      return "SD1.5" as const
    }
    return null
  })()

  const triggerWords = (() => {
    if (typeof metadata.ss_tag_frequency !== "string") return []
    try {
      const frequency = JSON.parse(metadata.ss_tag_frequency) as Record<
        string,
        Record<string, number>
      >
      const totals = new Map<string, number>()
      for (const dataset of Object.values(frequency)) {
        for (const [tag, count] of Object.entries(dataset)) {
          const name = tag.trim()
          if (!name) continue
          totals.set(name, (totals.get(name) ?? 0) + count)
        }
      }
      return [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag)
    } catch {
      return []
    }
  })()

  const title =
    typeof metadata["modelspec.title"] === "string"
      ? metadata["modelspec.title"]
      : typeof metadata.ss_output_name === "string"
        ? metadata.ss_output_name
        : null

  return { kind, baseModel, triggerWords, title }
}

/**
 * ファイル先頭からヘッダーを読む。safetensors でなければ null
 */
export const readSafetensorsInfo = async (
  file: Blob,
): Promise<SafetensorsInfo | null> => {
  if (file.size < 16) return null
  const lengthBuffer = await file.slice(0, 8).arrayBuffer()
  const view = new DataView(lengthBuffer)
  const headerLength = Number(view.getBigUint64(0, true))
  if (
    !Number.isFinite(headerLength) ||
    headerLength <= 2 ||
    headerLength > 100 * 1024 * 1024 ||
    headerLength + 8 > file.size
  ) {
    return null
  }
  try {
    const text = await file.slice(8, 8 + headerLength).text()
    const json = JSON.parse(text) as unknown
    if (json === null || typeof json !== "object" || Array.isArray(json)) {
      return null
    }
    return parseSafetensorsHeader(json as Record<string, unknown>)
  } catch {
    return null
  }
}

export type MultipartUploadProgress = {
  uploadedBytes: number
  totalBytes: number
  completedParts: number
  totalParts: number
  bytesPerSecond: number
  etaSeconds: number | null
}

/**
 * パートを並列送信する。pause() で送信中のパートを止め、start() を再度呼ぶと未送信分から再開する
 */
export class MultipartUploader {
  private readonly parts: PartPlan[]
  private readonly completed = new Map<number, UploadedPart>()
  private readonly inFlight = new Map<number, number>()
  private controller: AbortController | null = null
  private readonly meter = new TransferSpeedMeter()

  constructor(
    private readonly props: {
      file: Blob
      partSize: number
      concurrency?: number
      maxRetries?: number
      uploadedParts?: UploadedPart[]
      sendPart(args: {
        partNumber: number
        blob: Blob
        signal: AbortSignal
        onProgress(loadedBytes: number): void
      }): Promise<UploadedPart>
      onProgress?(progress: MultipartUploadProgress): void
    },
  ) {
    this.parts = planParts(props.file.size, props.partSize)
    for (const part of props.uploadedParts ?? []) {
      if (part.etag && part.partNumber <= this.parts.length) {
        this.completed.set(part.partNumber, part)
      }
    }
  }

  get uploadedParts(): UploadedPart[] {
    return [...this.completed.values()].sort(
      (a, b) => a.partNumber - b.partNumber,
    )
  }

  get isComplete(): boolean {
    return this.completed.size === this.parts.length
  }

  get progress(): MultipartUploadProgress {
    const completedBytes = this.parts
      .filter((part) => this.completed.has(part.partNumber))
      .reduce((sum, part) => sum + (part.end - part.start), 0)
    const inFlightBytes = [...this.inFlight.values()].reduce((a, b) => a + b, 0)
    const uploadedBytes = Math.min(
      this.props.file.size,
      completedBytes + inFlightBytes,
    )
    return {
      uploadedBytes,
      totalBytes: this.props.file.size,
      completedParts: this.completed.size,
      totalParts: this.parts.length,
      bytesPerSecond: this.meter.bytesPerSecond,
      etaSeconds: this.meter.etaSeconds(this.props.file.size - uploadedBytes),
    }
  }

  pause(): void {
    this.controller?.abort()
    this.controller = null
  }

  private emit(): void {
    const progress = this.progress
    this.meter.push(progress.uploadedBytes)
    this.props.onProgress?.({
      ...progress,
      bytesPerSecond: this.meter.bytesPerSecond,
      etaSeconds: this.meter.etaSeconds(
        progress.totalBytes - progress.uploadedBytes,
      ),
    })
  }

  async start(): Promise<UploadedPart[]> {
    const controller = new AbortController()
    this.controller = controller
    this.meter.reset()
    this.inFlight.clear()
    this.emit()

    const queue = this.parts.filter(
      (part) => !this.completed.has(part.partNumber),
    )
    const concurrency = Math.max(1, this.props.concurrency ?? 3)
    const maxRetries = this.props.maxRetries ?? 3

    const worker = async () => {
      while (queue.length > 0) {
        if (controller.signal.aborted) {
          throw new DOMException("Aborted", "AbortError")
        }
        const part = queue.shift()
        if (!part) return
        let attempt = 0
        while (true) {
          try {
            const result = await this.props.sendPart({
              partNumber: part.partNumber,
              blob: this.props.file.slice(part.start, part.end),
              signal: controller.signal,
              onProgress: (loadedBytes) => {
                this.inFlight.set(part.partNumber, loadedBytes)
                this.emit()
              },
            })
            this.inFlight.delete(part.partNumber)
            this.completed.set(part.partNumber, result)
            this.emit()
            break
          } catch (error) {
            this.inFlight.delete(part.partNumber)
            const isAbort =
              error instanceof DOMException && error.name === "AbortError"
            const status =
              typeof error === "object" && error !== null && "status" in error
                ? Number((error as { status: unknown }).status)
                : 0
            const isClientError =
              status >= 400 && status < 500 && status !== 408 && status !== 429
            if (isAbort || isClientError || attempt >= maxRetries) {
              throw error
            }
            attempt += 1
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * 2 ** attempt),
            )
          }
        }
      }
    }

    try {
      await Promise.all(Array.from({ length: concurrency }, () => worker()))
    } catch (error) {
      controller.abort()
      throw error
    } finally {
      if (this.controller === controller) {
        this.controller = null
      }
    }

    return this.uploadedParts
  }
}
