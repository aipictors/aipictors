import type { TSortableItem } from "~/components/drag/sortable-item"
import {
  canvasToWebpDataUrl,
  detectAutoMosaic,
  isAnimatedImageDataUrl,
  isMosaicStyle,
  isRegionUnhidden,
  loadMosaicImage,
  MOSAIC_STRENGTH_MAX,
  MOSAIC_STRENGTH_MIN,
  type MosaicStyle,
  renderMosaicCanvas,
} from "~/utils/auto-mosaic"

/**
 * 投稿画面の自動モザイク
 * - 画像を選んだら（R18 / R18G）裏で検出し、見つかったらモザイクをかけた画像をプレビュー（一覧）に出す
 * - 投稿する画像（item.content）はかけた後の画像。元の画像・範囲・種類・濃さは item.mosaic に持つので、後から何度でも直せる
 * - 検出の結果は元の画像ごとにこのファイルの中だけに覚えておく（ページを開き直したら検出し直す）
 */

export type PostMosaicDetection = {
  status: "pending" | "done" | "failed"
  /** 見つかった範囲（無ければ null） */
  mask: HTMLCanvasElement | null
  /** 見つかった数 */
  count: number
  /** 見つかった範囲のうち、隠れていないように見える数（「自分でかけ済み」の確認に使う） */
  unhiddenCount: number
  /** 見つかった範囲のうち一番高い確からしさ（0〜1。見つからなければ 0） */
  maxScore: number
}

export type PostMosaicSettings = { style: MosaicStyle; strength: number }

const STYLE_KEY = "post-mosaic-style"
const STRENGTH_KEY = "post-mosaic-strength"
const SELF_APPLIED_KEY = "post-mosaic-self-applied"

/** 隠れていないかの警告は、ある程度はっきり見つかったものだけにする */
const WARNING_MIN_SCORE = 0.35

const detections = new Map<string, PostMosaicDetection>()
const listeners = new Set<() => void>()
let version = 0
let queue: Promise<void> = Promise.resolve()

const notify = () => {
  version++
  for (const listener of listeners) listener()
}

export const subscribePostMosaic = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getPostMosaicVersion = () => version

export const getPostMosaicDetection = (source: string) =>
  detections.get(source) ?? null

/** モザイクをかけられる画像か（GIF・アニメーション WebP は動きが消えるので対象外） */
export const canPostMosaic = (content: string | null | undefined) =>
  Boolean(content) && !isAnimatedImageDataUrl(content as string)

/** 元の画像（モザイクをかける前） */
export const getItemMosaicSource = (item: TSortableItem) =>
  item.mosaic?.source ?? item.content

/** item にモザイクがかかっているか（範囲が空なら、かけていない） */
export const hasItemMosaic = (item: TSortableItem) =>
  Boolean(item.mosaic?.mask) && item.content !== item.mosaic?.source

/**
 * 検出を順番待ちに入れる（同時に動かすと端末が重くなるので 1 枚ずつ）
 * すでに検出済み・検出中なら何もしない
 */
export function requestPostMosaicDetection(source: string) {
  const current = detections.get(source)
  if (current && current.status !== "failed") return
  detections.set(source, {
    status: "pending",
    mask: null,
    count: 0,
    unhiddenCount: 0,
    maxScore: 0,
  })
  notify()
  queue = queue.then(async () => {
    // 待っている間に一覧から外れても、検出は軽いのでそのまま進める
    try {
      const image = await loadMosaicImage(source)
      const result = await detectAutoMosaic(image)
      const unhiddenCount = result.detections.filter(
        (detection) =>
          detection.score >= WARNING_MIN_SCORE &&
          isRegionUnhidden(image, result.mask, detection.box),
      ).length
      detections.set(source, {
        status: "done",
        mask: result.detections.length > 0 ? result.mask : null,
        count: result.detections.length,
        unhiddenCount,
        maxScore: Math.max(
          0,
          ...result.detections.map((detection) => detection.score),
        ),
      })
    } catch (error) {
      console.error(error)
      detections.set(source, {
        status: "failed",
        mask: null,
        count: 0,
        unhiddenCount: 0,
        maxScore: 0,
      })
    }
    notify()
  })
}

/** 指定した画像の検出がすべて終わるまで待つ */
export async function waitPostMosaicDetections(
  sources: string[],
  onProgress?: (done: number, total: number) => void,
) {
  for (const source of sources) requestPostMosaicDetection(source)
  const isDone = (source: string) =>
    detections.get(source)?.status !== "pending"
  const report = () =>
    onProgress?.(sources.filter(isDone).length, sources.length)
  report()
  if (sources.every(isDone)) return
  await new Promise<void>((resolve) => {
    const unsubscribe = subscribePostMosaic(() => {
      report()
      if (sources.every(isDone)) {
        unsubscribe()
        resolve()
      }
    })
  })
}

/** 範囲のキャンバスを PNG の data URL に（ほとんど透明なので小さい。下書きに保存する） */
export function maskToDataUrl(mask: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    mask.toBlob((blob) => {
      if (blob === null) {
        reject(new Error("Failed to encode mask"))
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result)
        else reject(new Error("Failed to read mask"))
      }
      reader.onerror = () => reject(new Error("Failed to read mask"))
      reader.readAsDataURL(blob)
    }, "image/png")
  })
}

/** 範囲（data URL かキャンバス）をキャンバスに */
export async function loadMask(
  mask: string | HTMLCanvasElement,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (ctx === null) throw new Error("canvas is not supported")
  const image = typeof mask === "string" ? await loadMosaicImage(mask) : mask
  ctx.drawImage(image, 0, 0, width, height)
  return canvas
}

/** 元の画像に範囲・種類・濃さでモザイクをかけた画像（data URL） */
export async function renderPostMosaic(
  source: string,
  mask: string | HTMLCanvasElement,
  settings: PostMosaicSettings,
) {
  const image = await loadMosaicImage(source)
  const maskCanvas = await loadMask(mask, image.width, image.height)
  const canvas = renderMosaicCanvas(
    image,
    maskCanvas,
    settings.style,
    settings.strength,
  )
  try {
    return await canvasToWebpDataUrl(canvas)
  } finally {
    canvas.width = 0
    canvas.height = 0
  }
}

/**
 * 自動でかけた結果の item（見つからなかった・検出できなかったときは null）
 */
export async function createAutoMosaicItem(
  item: TSortableItem,
  settings: PostMosaicSettings,
): Promise<TSortableItem | null> {
  const source = getItemMosaicSource(item)
  if (!source) return null
  const detection = detections.get(source)
  if (detection?.status !== "done" || detection.mask === null) return null
  const [content, mask] = await Promise.all([
    renderPostMosaic(source, detection.mask, settings),
    maskToDataUrl(detection.mask),
  ])
  return {
    ...item,
    content,
    isContentEdited: true,
    mosaic: { source, mask, ...settings, isAuto: true },
  }
}

/** 前に選んだ種類・濃さ（端末に保存） */
export function readPostMosaicSettings(): PostMosaicSettings {
  if (typeof window === "undefined") return { style: "mosaic", strength: 1 }
  const style = localStorage.getItem(STYLE_KEY)
  const strength = Number(localStorage.getItem(STRENGTH_KEY))
  return {
    style: isMosaicStyle(style) ? style : "mosaic",
    strength:
      Number.isFinite(strength) &&
      strength >= MOSAIC_STRENGTH_MIN &&
      strength <= MOSAIC_STRENGTH_MAX
        ? Math.round(strength)
        : 1,
  }
}

export function savePostMosaicSettings(settings: PostMosaicSettings) {
  localStorage.setItem(STYLE_KEY, settings.style)
  localStorage.setItem(STRENGTH_KEY, String(settings.strength))
}

/** 「自分でかけ済み（自動でかけない）」（端末に保存） */
export function readPostMosaicSelfApplied() {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SELF_APPLIED_KEY) === "1"
}

export function savePostMosaicSelfApplied(value: boolean) {
  if (value) localStorage.setItem(SELF_APPLIED_KEY, "1")
  else localStorage.removeItem(SELF_APPLIED_KEY)
}

/**
 * 「自分でかけ済み」のときに警告する画像か
 * （隠れていないように見える所が見つかり、この画面でもモザイクをかけていない）
 */
export function isItemMosaicWarning(item: TSortableItem) {
  if (hasItemMosaic(item)) return false
  const source = getItemMosaicSource(item)
  if (!source || !canPostMosaic(source)) return false
  return (detections.get(source)?.unhiddenCount ?? 0) > 0
}
