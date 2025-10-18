/**
 * 画像フィルター適用ユーティリティ
 */

export type FilterType =
  // レンズフィルター
  | "warming_85"
  | "warming_lba"
  | "warming_81"
  | "cooling_80"
  | "cooling_lbb"
  | "cooling_82"
  // カラーフィルター
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "violet"
  | "magenta"
  | "sepia"
  | "deep_red"
  | "deep_blue"
  | "deep_emerald"
  | "deep_yellow"
  // 環境フィルター
  | "underwater"
  // 画質調整
  | "sharpen"
  | "noise"
  | "pixelate"
  // ぼかし
  | "blur"
  // 表現手法
  | "artistic"
  | "sketch"

/**
 * フィルターをキャンバスに適用する
 */
export function applyImageFilter(
  canvas: HTMLCanvasElement,
  filterType: FilterType,
  intensity = 100,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // 強度を0-1の範囲に正規化
  const normalizedIntensity = intensity / 100

  switch (filterType) {
    // レンズフィルター
    case "warming_85":
      applyWarmingFilter(data, normalizedIntensity, { r: 1.1, g: 1.0, b: 0.8 })
      break
    case "warming_lba":
      applyWarmingFilter(data, normalizedIntensity, { r: 1.05, g: 1.0, b: 0.9 })
      break
    case "warming_81":
      applyWarmingFilter(data, normalizedIntensity, {
        r: 1.03,
        g: 1.0,
        b: 0.95,
      })
      break
    case "cooling_80":
      applyCoolingFilter(data, normalizedIntensity, { r: 0.9, g: 1.0, b: 1.1 })
      break
    case "cooling_lbb":
      applyCoolingFilter(data, normalizedIntensity, {
        r: 0.95,
        g: 1.0,
        b: 1.05,
      })
      break
    case "cooling_82":
      applyCoolingFilter(data, normalizedIntensity, {
        r: 0.92,
        g: 1.0,
        b: 1.08,
      })
      break

    // カラーフィルター
    case "red":
      applyColorFilter(data, normalizedIntensity, { r: 1.3, g: 0.7, b: 0.7 })
      break
    case "orange":
      applyColorFilter(data, normalizedIntensity, { r: 1.2, g: 0.9, b: 0.6 })
      break
    case "yellow":
      applyColorFilter(data, normalizedIntensity, { r: 1.1, g: 1.1, b: 0.7 })
      break
    case "green":
      applyColorFilter(data, normalizedIntensity, { r: 0.7, g: 1.3, b: 0.7 })
      break
    case "cyan":
      applyColorFilter(data, normalizedIntensity, { r: 0.7, g: 1.1, b: 1.1 })
      break
    case "blue":
      applyColorFilter(data, normalizedIntensity, { r: 0.7, g: 0.7, b: 1.3 })
      break
    case "violet":
      applyColorFilter(data, normalizedIntensity, { r: 1.1, g: 0.7, b: 1.2 })
      break
    case "magenta":
      applyColorFilter(data, normalizedIntensity, { r: 1.2, g: 0.7, b: 1.2 })
      break
    case "sepia":
      applySepiaFilter(data, normalizedIntensity)
      break
    case "deep_red":
      applyColorFilter(data, normalizedIntensity, { r: 1.5, g: 0.5, b: 0.5 })
      break
    case "deep_blue":
      applyColorFilter(data, normalizedIntensity, { r: 0.5, g: 0.5, b: 1.5 })
      break
    case "deep_emerald":
      applyColorFilter(data, normalizedIntensity, { r: 0.4, g: 1.4, b: 0.6 })
      break
    case "deep_yellow":
      applyColorFilter(data, normalizedIntensity, { r: 1.3, g: 1.3, b: 0.4 })
      break
    case "underwater":
      applyUnderwaterFilter(data, normalizedIntensity)
      break

    // 画質調整
    case "sharpen":
      applySharpenFilter(canvas, normalizedIntensity)
      return // convolutionフィルターは別処理
    case "noise":
      applyNoiseFilter(data, normalizedIntensity)
      break
    case "pixelate":
      applyPixelateFilter(canvas, normalizedIntensity)
      return // 特殊処理

    // ぼかし
    case "blur":
      applyBlurFilter(canvas, normalizedIntensity)
      return // convolutionフィルター

    // 表現手法
    case "artistic":
      applyArtisticFilter(data, normalizedIntensity)
      break
    case "sketch":
      applySketchFilter(data, normalizedIntensity)
      break

    default:
      console.warn(`Unsupported filter type: ${filterType}`)
      return
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * ウォーミングフィルターを適用
 */
function applyWarmingFilter(
  data: Uint8ClampedArray,
  intensity: number,
  factors: { r: number; g: number; b: number },
): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    data[i] = Math.min(255, r + r * (factors.r - 1) * intensity)
    data[i + 1] = Math.min(255, g + g * (factors.g - 1) * intensity)
    data[i + 2] = Math.min(255, b + b * (factors.b - 1) * intensity)
  }
}

/**
 * クーリングフィルターを適用
 */
function applyCoolingFilter(
  data: Uint8ClampedArray,
  intensity: number,
  factors: { r: number; g: number; b: number },
): void {
  applyWarmingFilter(data, intensity, factors) // 同じロジック
}

/**
 * カラーフィルターを適用
 */
function applyColorFilter(
  data: Uint8ClampedArray,
  intensity: number,
  factors: { r: number; g: number; b: number },
): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const newR = r + (r * factors.r - r) * intensity
    const newG = g + (g * factors.g - g) * intensity
    const newB = b + (b * factors.b - b) * intensity

    data[i] = Math.min(255, Math.max(0, newR))
    data[i + 1] = Math.min(255, Math.max(0, newG))
    data[i + 2] = Math.min(255, Math.max(0, newB))
  }
}

/**
 * セピアフィルターを適用
 */
function applySepiaFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const sepiaR = r * 0.393 + g * 0.769 + b * 0.189
    const sepiaG = r * 0.349 + g * 0.686 + b * 0.168
    const sepiaB = r * 0.272 + g * 0.534 + b * 0.131

    data[i] = Math.min(255, r + (sepiaR - r) * intensity)
    data[i + 1] = Math.min(255, g + (sepiaG - g) * intensity)
    data[i + 2] = Math.min(255, b + (sepiaB - b) * intensity)
  }
}

/**
 * 水中フィルターを適用
 */
function applyUnderwaterFilter(
  data: Uint8ClampedArray,
  intensity: number,
): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // 青緑を強調し、赤を減らす
    const newR = r * (1 - 0.3 * intensity)
    const newG = g * (1 + 0.1 * intensity)
    const newB = b * (1 + 0.4 * intensity)

    data[i] = Math.min(255, Math.max(0, newR))
    data[i + 1] = Math.min(255, Math.max(0, newG))
    data[i + 2] = Math.min(255, Math.max(0, newB))
  }
}

/**
 * ノイズフィルターを適用
 */
function applyNoiseFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 50 * intensity

    data[i] = Math.min(255, Math.max(0, data[i] + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
  }
}

/**
 * アーティスティックフィルターを適用
 */
function applyArtisticFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // 色を強調し、コントラストを上げる
    const factor = 1 + intensity * 0.5
    data[i] = Math.min(255, Math.max(0, (r - 128) * factor + 128))
    data[i + 1] = Math.min(255, Math.max(0, (g - 128) * factor + 128))
    data[i + 2] = Math.min(255, Math.max(0, (b - 128) * factor + 128))
  }
}

/**
 * スケッチフィルターを適用
 */
function applySketchFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // グレースケール化してエッジを強調
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    const sketch = 255 - gray

    const finalR = r + (sketch - r) * intensity
    const finalG = g + (sketch - g) * intensity
    const finalB = b + (sketch - b) * intensity

    data[i] = Math.min(255, Math.max(0, finalR))
    data[i + 1] = Math.min(255, Math.max(0, finalG))
    data[i + 2] = Math.min(255, Math.max(0, finalB))
  }
}

/**
 * シャープフィルターを適用（Convolution）
 */
function applySharpenFilter(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const kernel = [
    0,
    -intensity,
    0,
    -intensity,
    1 + 4 * intensity,
    -intensity,
    0,
    -intensity,
    0,
  ]

  applyConvolutionFilter(canvas, kernel)
}

/**
 * ぼかしフィルターを適用
 */
function applyBlurFilter(canvas: HTMLCanvasElement, intensity: number): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const amount = intensity / 100
  const kernel = [
    amount / 9,
    amount / 9,
    amount / 9,
    amount / 9,
    amount / 9,
    amount / 9,
    amount / 9,
    amount / 9,
    amount / 9,
  ]

  applyConvolutionFilter(canvas, kernel)
}

/**
 * ガウシアンぼかしを適用
 */
function _applyGaussianBlur(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const amount = intensity / 100
  const kernel = [
    amount / 16,
    (amount * 2) / 16,
    amount / 16,
    (amount * 2) / 16,
    (amount * 4) / 16,
    (amount * 2) / 16,
    amount / 16,
    (amount * 2) / 16,
    amount / 16,
  ]

  applyConvolutionFilter(canvas, kernel)
}

/**
 * ピクセレートフィルターを適用
 */
function applyPixelateFilter(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixelSize = Math.max(1, Math.floor(intensity * 20)) // より明確なピクセル効果

  // 新しいImageDataを作成
  const newImageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data
  const newData = newImageData.data

  for (let y = 0; y < canvas.height; y += pixelSize) {
    for (let x = 0; x < canvas.width; x += pixelSize) {
      // ピクセルブロックの平均色を計算
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let count = 0

      for (let py = y; py < Math.min(y + pixelSize, canvas.height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, canvas.width); px++) {
          const i = (py * canvas.width + px) * 4
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          a += data[i + 3]
          count++
        }
      }

      // 平均色
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)
      a = Math.round(a / count)

      // ピクセルブロック全体に平均色を適用
      for (let py = y; py < Math.min(y + pixelSize, canvas.height); py++) {
        for (let px = x; px < Math.min(x + pixelSize, canvas.width); px++) {
          const i = (py * canvas.width + px) * 4
          newData[i] = r
          newData[i + 1] = g
          newData[i + 2] = b
          newData[i + 3] = a
        }
      }
    }
  }

  ctx.putImageData(newImageData, 0, 0)
}

/**
 * Convolutionフィルターを適用する汎用関数
 */
function applyConvolutionFilter(
  canvas: HTMLCanvasElement,
  kernel: number[],
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height
  const output = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      let r = 0
      let g = 0
      let b = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          const pixelIdx = ((y + ky) * width + (x + kx)) * 4

          r += data[pixelIdx] * kernel[kernelIdx]
          g += data[pixelIdx + 1] * kernel[kernelIdx]
          b += data[pixelIdx + 2] * kernel[kernelIdx]
        }
      }

      output[idx] = Math.min(255, Math.max(0, r))
      output[idx + 1] = Math.min(255, Math.max(0, g))
      output[idx + 2] = Math.min(255, Math.max(0, b))
    }
  }

  const newImageData = new ImageData(output, width, height)
  ctx.putImageData(newImageData, 0, 0)
}

/**
 * 広角補正フィルターを適用
 */
function _applyWideAngleCorrection(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(centerX, centerY)

  // 元の画像データをコピー
  const originalData = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > maxRadius) continue

      // 広角補正の計算
      const normalizedDistance = distance / maxRadius
      const correctionFactor =
        1 + intensity * 0.3 * normalizedDistance * normalizedDistance

      const sourceX = centerX + dx / correctionFactor
      const sourceY = centerY + dy / correctionFactor

      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const sourceIndex =
          (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4
        const targetIndex = (y * width + x) * 4

        data[targetIndex] = originalData[sourceIndex]
        data[targetIndex + 1] = originalData[sourceIndex + 1]
        data[targetIndex + 2] = originalData[sourceIndex + 2]
        data[targetIndex + 3] = originalData[sourceIndex + 3]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Camera Rawフィルターを適用
 */
function _applyCameraRawFilter(
  data: Uint8ClampedArray,
  intensity: number,
): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // コントラスト調整
    const contrast = 1 + intensity * 0.2
    const newR = ((r / 255 - 0.5) * contrast + 0.5) * 255
    const newG = ((g / 255 - 0.5) * contrast + 0.5) * 255
    const newB = ((b / 255 - 0.5) * contrast + 0.5) * 255

    // 彩度調整
    const gray = 0.299 * newR + 0.587 * newG + 0.114 * newB
    const saturation = 1 + intensity * 0.3

    data[i] = Math.min(255, Math.max(0, gray + (newR - gray) * saturation))
    data[i + 1] = Math.min(255, Math.max(0, gray + (newG - gray) * saturation))
    data[i + 2] = Math.min(255, Math.max(0, gray + (newB - gray) * saturation))
  }
}

/**
 * レンズ補正フィルターを適用
 */
function _applyLensCorrection(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2

  // 元の画像データをコピー
  const originalData = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

      // 樽型歪み補正
      const normalizedDistance = distance / maxDistance
      const correctionFactor =
        1 - intensity * 0.2 * normalizedDistance * normalizedDistance

      const sourceX = centerX + dx * correctionFactor
      const sourceY = centerY + dy * correctionFactor

      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const sourceIndex =
          (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4
        const targetIndex = (y * width + x) * 4

        data[targetIndex] = originalData[sourceIndex]
        data[targetIndex + 1] = originalData[sourceIndex + 1]
        data[targetIndex + 2] = originalData[sourceIndex + 2]
        data[targetIndex + 3] = originalData[sourceIndex + 3]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * ゆがみフィルターを適用
 */
function _applyDistortionFilter(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2

  // 元の画像データをコピー
  const originalData = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // 波状のゆがみ効果
      const wave = Math.sin(distance * 0.02) * intensity * 10
      const sourceX = x + Math.cos(Math.atan2(dy, dx)) * wave
      const sourceY = y + Math.sin(Math.atan2(dy, dx)) * wave

      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const sourceIndex =
          (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4
        const targetIndex = (y * width + x) * 4

        data[targetIndex] = originalData[sourceIndex]
        data[targetIndex + 1] = originalData[sourceIndex + 1]
        data[targetIndex + 2] = originalData[sourceIndex + 2]
        data[targetIndex + 3] = originalData[sourceIndex + 3]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Vanishing Pointフィルターを適用
 */
function _applyVanishingPointFilter(
  canvas: HTMLCanvasElement,
  intensity: number,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2

  // 元の画像データをコピー
  const originalData = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY

      // 遠近感効果
      const perspective =
        1 +
        (intensity * 0.001 * (dx * dx + dy * dy)) /
          (width * width + height * height)
      const sourceX = centerX + dx * perspective
      const sourceY = centerY + dy * perspective

      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const sourceIndex =
          (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4
        const targetIndex = (y * width + x) * 4

        data[targetIndex] = originalData[sourceIndex]
        data[targetIndex + 1] = originalData[sourceIndex + 1]
        data[targetIndex + 2] = originalData[sourceIndex + 2]
        data[targetIndex + 3] = originalData[sourceIndex + 3]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * 3Dフィルターを適用
 */
function _apply3DFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // 3D効果（アナグリフ効果）
    const redChannel = r * (1 + intensity * 0.3)
    const blueChannel = b * (1 + intensity * 0.2)

    data[i] = Math.min(255, redChannel)
    data[i + 1] = g * (1 - intensity * 0.1)
    data[i + 2] = Math.min(255, blueChannel)
  }
}

/**
 * フィルター名を日本語で取得
 */
export function getFilterDisplayName(filterType: FilterType): string {
  const names: Record<FilterType, string> = {
    // レンズフィルター
    warming_85: "Warming Filter (85)",
    warming_lba: "Warming Filter (LBA)",
    warming_81: "Warming Filter (81)",
    cooling_80: "Cooling Filter (80)",
    cooling_lbb: "Cooling Filter (LBB)",
    cooling_82: "Cooling Filter (82)",

    // カラーフィルター
    red: "レッド",
    orange: "オレンジ",
    yellow: "イエロー",
    green: "グリーン",
    cyan: "シアン",
    blue: "ブルー",
    violet: "バイオレット",
    magenta: "マゼンタ",
    sepia: "セピア",
    deep_red: "ディープレッド",
    deep_blue: "ディープブルー",
    deep_emerald: "ディープエメラルド",
    deep_yellow: "ディープイエロー",
    underwater: "水中",

    // 画質調整
    sharpen: "シャープ",
    noise: "ノイズ",
    pixelate: "ピクセレート",

    // ぼかし
    blur: "ぼかし",

    // 表現手法
    artistic: "表現手法",
    sketch: "描画",
  }

  return names[filterType] || filterType
}
