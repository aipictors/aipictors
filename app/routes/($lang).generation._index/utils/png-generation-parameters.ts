type GenerationParams = {
  prompt?: string | null
  negativePrompt?: string | null
  steps?: number | string | null
  sampler?: string | null
  scale?: number | string | null
  seed?: number | string | null
  width?: number | null
  height?: number | null
  model?: { name: string } | null
}

/**
 * 生成履歴の内容を、投稿画面が読める PNG の生成情報（parameters）の文字列にする
 */
export const toPngParametersText = (task: GenerationParams): string => {
  const items = [
    task.steps !== null && task.steps !== undefined
      ? `Steps: ${task.steps}`
      : null,
    task.sampler ? `Sampler: ${task.sampler}` : null,
    task.scale !== null && task.scale !== undefined
      ? `CFG scale: ${task.scale}`
      : null,
    task.seed !== null && task.seed !== undefined ? `Seed: ${task.seed}` : null,
    task.width && task.height ? `Size: ${task.width}x${task.height}` : null,
    task.model?.name ? `Model: ${task.model.name}` : null,
  ].filter((item) => item !== null)
  return `${task.prompt ?? ""}\nNegative prompt: ${task.negativePrompt ?? ""}\n${items.join(", ")}`
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

const TEXT_CHUNK_TYPES = ["tEXt", "iTXt", "zTXt"]

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return c >>> 0
})

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * PNG に生成情報（テキストのチャンク）が無いときだけ、parameters を IHDR の直後に書き込む。
 * 生成サーバーによっては PNG に生成情報が入らないので、ダウンロードした画像から投稿しても生成情報が読めるようにする
 */
export const addPngParameters = (
  data: Uint8Array,
  text: string,
): Uint8Array => {
  if (
    data.length < 33 ||
    !PNG_SIGNATURE.every((byte, index) => data[index] === byte)
  ) {
    return data
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  let offset = 8
  while (offset + 8 <= data.length) {
    const type = String.fromCharCode(...data.subarray(offset + 4, offset + 8))
    if (TEXT_CHUNK_TYPES.includes(type)) return data
    if (type === "IEND") break
    offset += 12 + view.getUint32(offset)
  }

  // 投稿画面の読み取り（get-extract-info-from-png）は UTF-8 で読むので、日本語もそのまま入れる
  const body = new TextEncoder().encode(`parameters\0${text}`)
  const chunk = new Uint8Array(12 + body.length)
  const chunkView = new DataView(chunk.buffer)
  chunkView.setUint32(0, body.length)
  chunk.set([116, 69, 88, 116], 4)
  chunk.set(body, 8)
  chunkView.setUint32(
    8 + body.length,
    crc32(chunk.subarray(4, 8 + body.length)),
  )

  // IHDR は署名(8) + 長さ・種類(8) + 13 バイト + CRC(4) の 33 バイト目まで
  const result = new Uint8Array(data.length + chunk.length)
  result.set(data.subarray(0, 33), 0)
  result.set(chunk, 33)
  result.set(data.subarray(33), 33 + chunk.length)
  return result
}
