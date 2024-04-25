interface PNGChunk {
  keyword: string
  text: string
}

interface PNGInfo {
  [key: string]: string | undefined
}

export interface ImageParameters {
  prompt: string
  negativePrompt: string
  seed: string
  steps: string
  scale: string
  sampler: string
  strategy: string
  noise: string
  vae: string
  modelHash: string
  model: string
}

/**
 * PNGInfoを返す
 * @param file
 * @param callback
 */
export const getExtractInfoFromPNG = async (file: File): Promise<PNGInfo> => {
  const chunks = await extractInfoFromPNG(file)
  const pngInfo = parsePNGInfo(chunks)
  return pngInfo
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

const parsePNGInfo = (chunks: PNGChunk[]): PNGInfo => {
  const info: PNGInfo = {}

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

        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.uc
        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.steps
        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.sampler
        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.seed
        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.strength
        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.noise
        // biome-ignore lint/performance/noDelete: <explanation>
        delete json.scale
        info.other = objectToText(json)
      } catch (error) {
        console.log("Comment parse error: ", error, comment.text)
      }
    }
  } else if (chunks.some((e) => e.keyword === "parameters")) {
    const text = chunks[0].text
    const promptMatch = text.match(/^(.+?)\s*Negative prompt:/)
    const prompt = promptMatch ? promptMatch[1].trim() : ""
    info.prompt = prompt

    // Extract negative prompt
    const negativePromptMatch = text.match(/Negative prompt:\s*(.+?),\s*Steps:/)
    const negativePrompt = negativePromptMatch
      ? negativePromptMatch[1].trim()
      : ""
    info.negativePrompt = negativePrompt

    // Extract steps
    const stepsMatch = text.match(/Steps:\s*(\d+),/)
    const steps = stepsMatch ? Number.parseInt(stepsMatch[1], 10) : 0
    info.steps = steps.toString()

    // Extract model
    const modelMatch = text.match(/Model:\s*([^,]+)/)
    const model = modelMatch ? modelMatch[1].trim() : ""
    info.model = model

    // Extract VAE
    const vaeMatch = text.match(/VAE:\s*([^,]+)/)
    const vae = vaeMatch ? vaeMatch[1].trim() : ""
    info.vae = vae

    // Extract Model hash
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
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
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
