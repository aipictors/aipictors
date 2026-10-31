/**
 * 動画からサムネイル用の 1 コマを PNG の DataURL で切り出す（メタデータ読み込み済みの video を渡す）
 * シーク直後はまだ絵が出ていないことがあり（特に Safari・スマホ）、真っ黒なサムネイルと OGP で投稿されていた。
 * 絵が出るのを待ってから描き、真っ黒なら別の位置で撮り直す
 */
export const captureVideoThumbnail = async (
  video: HTMLVideoElement,
): Promise<string> => {
  video.muted = true
  video.playsInline = true

  const duration = Number.isFinite(video.duration) ? video.duration : 0
  // 真ん中 → 4 分の 1 → 4 分の 3 → 先頭付近の順に試す
  const times = [0.5, 0.25, 0.75, 0.05].map((ratio) =>
    Math.min(Math.max(duration * ratio, 0), Math.max(duration - 0.05, 0)),
  )

  let lastDataUrl: string | null = null
  for (const time of times) {
    await seekTo(video, time)
    await waitForFrame(video)
    const width = video.videoWidth
    const height = video.videoHeight
    if (width === 0 || height === 0) continue
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) break
    ctx.drawImage(video, 0, 0, width, height)
    lastDataUrl = canvas.toDataURL()
    if (!isAlmostBlack(ctx, width, height)) {
      return lastDataUrl
    }
  }

  if (lastDataUrl) {
    // どこを撮っても暗い動画はそのまま使う
    return lastDataUrl
  }
  throw new Error("Failed to capture video frame")
}

const seekTo = (video: HTMLVideoElement, time: number): Promise<void> => {
  return new Promise((resolve) => {
    const timer = window.setTimeout(done, 3000)
    function done() {
      window.clearTimeout(timer)
      video.removeEventListener("seeked", done)
      resolve()
    }
    video.addEventListener("seeked", done)
    video.currentTime = time
  })
}

/**
 * シークした位置の絵がデコードされるまで待つ
 */
const waitForFrame = (video: HTMLVideoElement): Promise<void> => {
  const withCallback = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number
  }
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, 500)
    const finish = () => {
      window.clearTimeout(timer)
      resolve()
    }
    if (typeof withCallback.requestVideoFrameCallback === "function") {
      withCallback.requestVideoFrameCallback(finish)
      // 止まったままの動画はコールバックが来ないことがあるので、再生を一瞬だけ挟む
      video
        .play()
        .then(() => video.pause())
        .catch(() => {})
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(finish))
  })
}

const isAlmostBlack = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean => {
  try {
    const step = Math.max(1, Math.floor(Math.min(width, height) / 32))
    const data = ctx.getImageData(0, 0, width, height).data
    let total = 0
    let count = 0
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        total += data[index] + data[index + 1] + data[index + 2]
        count += 1
      }
    }
    return count > 0 && total / (count * 3) < 4
  } catch {
    return false
  }
}
