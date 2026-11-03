import {
  applyColorKeyToPixels,
  normalizeHexColor,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-color"

export const isRemoteHttpUrl = (src: string) =>
  src.startsWith("https://") || src.startsWith("http://")

export const toCanvasSafeImageUrl = (src: string) => {
  if (!isRemoteHttpUrl(src)) return src
  return `/api/proxy-image?url=${encodeURIComponent(src)}`
}

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

export const resolveImageSize = async (src: string) => {
  const img = await loadImage(src)
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  }
}

export const pickColorWithEyeDropper = async (): Promise<string | null> => {
  const anyWindow = window as unknown as {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> }
  }
  if (!anyWindow.EyeDropper) return null

  try {
    const dropper = new anyWindow.EyeDropper()
    const result = await dropper.open()
    return normalizeHexColor(result.sRGBHex)
  } catch {
    // user canceled / permission denied
    return null
  }
}

export const canvasToBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"))
          return
        }
        resolve(blob)
      },
      type,
      0.95,
    )
  })

export const createColorKeyTransparentCanvas = (props: {
  img: HTMLImageElement
  colorKey: string
  threshold: number
}) => {
  const width = props.img.naturalWidth || props.img.width
  const height = props.img.naturalHeight || props.img.height
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2d context is not available")

  ctx.drawImage(props.img, 0, 0)

  let imageData: ImageData
  try {
    imageData = ctx.getImageData(0, 0, width, height)
  } catch {
    // CORSでtaintされると例外になる
    throw new Error("CORS blocked image processing")
  }

  applyColorKeyToPixels({
    data: imageData.data,
    colorKey: props.colorKey,
    threshold: props.threshold,
  })

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export const createColorKeyTransparentObjectUrl = async (props: {
  src: string
  colorKey: string
  threshold: number
}) => {
  const img = await loadImage(toCanvasSafeImageUrl(props.src))
  const canvas = createColorKeyTransparentCanvas({
    img,
    colorKey: props.colorKey,
    threshold: props.threshold,
  })
  const blob = await canvasToBlob(canvas, "image/png")
  return URL.createObjectURL(blob)
}
