interface PNGChunk {
  keyword: string
  text: string
}

interface PNGItem {
  [key: string]: string | undefined
}

interface ImageParameters {
  prompt: string | null
  negativePrompt: string | null
  seed: string | null
  steps: string | null
  strength: string | null
  noise: string | null
  scale: string | null
  sampler: string | null
  vae: string | null
  modelHash: string | null
  model: string | null
}

export interface PNGInfo {
  params: ImageParameters
  src: string | null
}

/**
 * PNGInfoを返す
 * @param file
 * @param callback
 */
export const getExtractInfoFromPNG = async (file: File): Promise<PNGInfo> => {
  const chunks = await extractInfoFromPNG(file)
  const pngInfo = parsePNGInfo(chunks)
  const pngStr = getPngInfo(chunks)
  return { params: exchangeFromPNGItem(pngInfo), src: pngStr }
}

export const getExtractInfoFromBase64PNG = async (
  base64: string,
): Promise<PNGInfo> => {
  const file = await urlToFile(base64, "image.png")
  return await getExtractInfoFromPNG(file)
}

/**
 * Converts an image URL to a File object.
 * @param imageUrl - The URL of the image.
 * @param fileName - The desired name of the file.
 * @returns A promise that resolves to the File object.
 */
async function urlToFile(imageUrl: string, fileName: string): Promise<File> {
  // Fetch the image data
  const response = await fetch(imageUrl)
  const blob = await response.blob()

  // Create a File object from the Blob
  return new File([blob], fileName, { type: blob.type })
}

/**
 * Base64からPNGInfoを解析する
 * @param imageUrl
 */
export const getExtractInfoFromBase64 = async (
  imageUrl: string,
): Promise<PNGInfo> => {
  const file = await urlToFile(imageUrl, "image.png")
  return await getExtractInfoFromPNG(file)
}

/**
 * PNGInfoを解析する
 * @param file
 * @param callback
 */
const extractInfoFromPNG = (file: File): Promise<PNGChunk[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer
      const view = new DataView(buffer)

      const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
      if (!pngSignature.every((byte, index) => view.getUint8(index) === byte)) {
        reject(new Error("Invalid PNG file signature."))
        return
      }

      const chunks: PNGChunk[] = []

      const readChunks = (offset: number): void => {
        if (offset < buffer.byteLength) {
          const length = view.getUint32(offset)
          const typeOffset = offset + 4
          const type = arrayBufferUTF8ToString(
            buffer.slice(typeOffset, typeOffset + 4),
          )
          const nextOffset = typeOffset + 4

          const findKeywordEnd = (keywordOffset: number): number => {
            if (view.getUint8(keywordOffset) === 0) return keywordOffset
            return findKeywordEnd(keywordOffset + 1)
          }

          if (type === "tEXt" || type === "iTXt") {
            const keywordEndIndex = findKeywordEnd(nextOffset)
            const keyword = arrayBufferUTF8ToString(
              buffer.slice(nextOffset, keywordEndIndex),
            )
            const text = arrayBufferUTF8ToString(
              buffer.slice(keywordEndIndex + 1, nextOffset + length),
            )
            chunks.push({ keyword, text })
          }

          readChunks(nextOffset + length + 4) // Add length and CRC
        } else {
          resolve(chunks)
        }
      }
      readChunks(8)
    }
    reader.onerror = () => reject(new Error("Failed to read the file."))
    reader.readAsArrayBuffer(file)
  })
}

const getPngInfo = (chunks: PNGChunk[]): string => {
  // 一つの文字列にする
  const info = chunks.map((e) => `${e.keyword}: ${e.text}`).join("\n")
  return info
}

const exchangeFromPNGItem = (item: PNGItem): ImageParameters => {
  const parameters: ImageParameters = {
    prompt: item.prompt ?? "",
    negativePrompt: item.negativePrompt ?? "",
    seed: item.seed ?? "",
    steps: item.steps ?? "",
    strength: item.strength ?? "",
    noise: item.noise ?? "",
    scale: item.scale ?? "",
    sampler: item.sampler ?? "",
    vae: item.vae ?? "",
    modelHash: item.modelHash ?? "",
    model: item.model ?? "",
  }
  return parameters
}

const parsePNGInfo = (chunks: PNGChunk[]): PNGItem => {
  const info: PNGItem = {}

  if (chunks.some((e) => e.keyword === "Software" && e.text === "NovelAI")) {
    const description = chunks.find((e) => e.keyword === "Description")
    if (description) {
      info.prompt = description.text
    }

    const comment = chunks.find((e) => e.keyword === "Comment")
    if (comment) {
      try {
        const json = JSON.parse(comment.text)

        info.negativePrompt = json.uc
        info.steps = json.steps
        info.sampler = json.sampler
        info.seed = json.seed
        info.strength = json.strength
        info.noise = json.noise
        info.scale = json.scale

        // JSONをMapに変換
        const jsonMap = new Map(Object.entries(json))

        // 削除したいキーのリスト
        const keysToDelete = [
          "uc",
          "steps",
          "sampler",
          "seed",
          "strength",
          "noise",
          "scale",
        ]

        for (const key of keysToDelete) {
          jsonMap.delete(key)
        }

        info.other = objectToText(json)
      } catch (error) {
        console.error("Comment parse error: ", error, comment.text)
      }
    }
  } else if (chunks.some((e) => e.keyword === "parameters")) {
    // prompts
    const text = chunks[0].text
    const promptMatch = text.match(/^(.+?)\s*Negative prompt:/)
    const prompt = promptMatch ? promptMatch[1].trim() : ""
    info.prompt = prompt

    // negativePrompts
    const negativePromptMatch = text.match(/Negative prompt:\s*(.+?),\s*Steps:/)
    const negativePrompt = negativePromptMatch
      ? negativePromptMatch[1].trim()
      : ""
    info.negativePrompt = negativePrompt

    // seed
    const seedMatch = text.match(/Seed:\s*(\d+),/)
    const seed = seedMatch ? Number.parseInt(seedMatch[1], 10) : 0
    info.seed = seed.toString()

    // scale
    const scaleMatch = text.match(/CFG scale:\s*([^,]+)/)
    const scale = scaleMatch ? scaleMatch[1] : ""
    info.scale = scale

    // steps
    const stepsMatch = text.match(/Steps:\s*(\d+),/)
    const steps = stepsMatch ? Number.parseInt(stepsMatch[1], 10) : 0
    info.steps = steps.toString()

    // strength
    const strengthMatch = text.match(/Denoising strength:\s*([^,]+)/)
    const strength = strengthMatch ? strengthMatch[1] : ""
    info.strength = strength

    // sampler
    const samplerMatch = text.match(/Sampler:\s*([^,]+)/)
    const sampler = samplerMatch ? samplerMatch[1] : ""
    info.sampler = sampler.toString()

    // noise
    const noiseMatch = text.match(/Noise:\s*([^,]+)/)
    const noise = noiseMatch ? noiseMatch[1] : ""
    info.noise = noise

    // model
    const modelMatch = text.match(/Model:\s*([^,]+)/)
    const model = modelMatch ? modelMatch[1].trim() : ""
    info.model = model

    // vae
    const vaeMatch = text.match(/VAE:\s*([^,]+)/)
    const vae = vaeMatch ? vaeMatch[1].trim() : ""
    info.vae = vae

    // modelHash
    const modelHashMatch = text.match(/Model hash:\s*([^,]+)/)
    const modelHash = modelHashMatch ? modelHashMatch[1].trim() : ""
    info.modelHash = modelHash
  }

  return info
}

const objectToText = (obj: Record<string, string | number>): string => {
  const fields = Object.entries(obj)
  fields.sort((a, b) => a[0].localeCompare(b[0]))

  const text = fields
    .map(
      ([key, value]) =>
        `${controlCodeToSpace(String(key))}: ${controlCodeToSpace(
          String(value),
        )}`,
    )
    .join("\n")

  return `${text}\n`
}

const controlCodeToSpace = (str: string): string => {
  return str.replace(/[\n\r\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
}

const arrayBufferUTF8ToString = (arrayBuffer: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(arrayBuffer)
  const binStr = String.fromCharCode(...uint8Array)
  return decodeURIComponent(escapeBinStr(binStr))
}

const escapeBinStr = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9@*_+\-./]/g, (m) => {
    const code = m.charCodeAt(0)
    if (code <= 0xff) {
      return `%${`00${code.toString(16)}`.slice(-2).toUpperCase()}`
    }
    return `%u${`0000${code.toString(16)}`.slice(-4).toUpperCase()}`
  })
}
