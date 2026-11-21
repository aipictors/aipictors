import {
  type GachaItem,
  type GachaRarity,
  gachaRarityRank,
} from "~/components/gacha/gacha-direction"

/**
 * ガチャの結果を 1 枚の画像にして共有する。
 * iPhone の Safari は共有シートを押した瞬間に開かないと拒むので、画像は結果が出た時点で先に作っておく
 */

const SITE_URL = "https://www.aipictors.com/"
const PICTOR_URL = "/images/pictor-chan/gacha-nice.webp"

const WIDTH = 1080
const HEIGHT = 1350

const FRAME_COLORS: Record<GachaRarity, string[]> = {
  N: ["#cbd5e1", "#64748b"],
  R: ["#7dd3fc", "#2563eb"],
  SR: ["#f0abfc", "#7c3aed"],
  SSR: ["#fef08a", "#fbbf24", "#f97316"],
  UR: ["#f472b6", "#fde047", "#38bdf8", "#a78bfa"],
}

const BADGE_COLOR: Record<GachaRarity, string> = {
  N: "#71717a",
  R: "#2563eb",
  SR: "#7c3aed",
  SSR: "#f59e0b",
  UR: "#ec4899",
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })

const roundRect = (
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
}

/** 縦横の比を保って枠の中に収める */
const drawContain = (
  g: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  const scale = Math.min(w / image.width, h / image.height)
  const dw = image.width * scale
  const dh = image.height * scale
  g.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

const fitText = (g: CanvasRenderingContext2D, text: string, max: number) => {
  if (g.measureText(text).width <= max) return text
  let cut = text
  while (cut.length > 1 && g.measureText(`${cut}…`).width > max) {
    cut = cut.slice(0, -1)
  }
  return `${cut}…`
}

/** 結果の画像（1080×1350、PNG） */
export async function renderGachaShareImage(
  items: readonly GachaItem[],
): Promise<Blob | null> {
  const canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const g = canvas.getContext("2d")
  if (!g) return null
  const font = (weight: number, size: number) =>
    `${weight} ${size}px "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif`

  // 高いレア度を先に並べる（いちばんの当たりが目に入るように）
  const sorted = [...items].sort(
    (a, b) => gachaRarityRank(b.rarity) - gachaRarityRank(a.rarity),
  )
  const [pictor, ...images] = await Promise.all([
    loadImage(PICTOR_URL),
    ...sorted.map((item) => loadImage(item.imageUrl)),
  ])

  // 背景: 夜空と後光
  const bg = g.createLinearGradient(0, 0, 0, HEIGHT)
  bg.addColorStop(0, "#2a1660")
  bg.addColorStop(0.6, "#120a33")
  bg.addColorStop(1, "#07051a")
  g.fillStyle = bg
  g.fillRect(0, 0, WIDTH, HEIGHT)
  const top = items.reduce<GachaRarity>(
    (best, item) =>
      gachaRarityRank(item.rarity) > gachaRarityRank(best) ? item.rarity : best,
    "N",
  )
  g.save()
  g.translate(WIDTH / 2, HEIGHT * 0.5)
  for (let i = 0; i < 24; i++) {
    g.rotate((Math.PI * 2) / 24)
    g.fillStyle = FRAME_COLORS[top][i % FRAME_COLORS[top].length]
    g.globalAlpha = i % 2 ? 0.05 : 0.1
    g.beginPath()
    g.moveTo(0, 0)
    g.lineTo(-120, -HEIGHT)
    g.lineTo(120, -HEIGHT)
    g.closePath()
    g.fill()
  }
  g.restore()
  g.globalAlpha = 1
  for (let i = 0; i < 90; i++) {
    g.fillStyle = "#fff"
    g.globalAlpha = 0.2 + Math.random() * 0.5
    g.beginPath()
    g.arc(
      Math.random() * WIDTH,
      Math.random() * HEIGHT,
      Math.random() * 2.4,
      0,
      Math.PI * 2,
    )
    g.fill()
  }
  g.globalAlpha = 1

  // 見出し
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillStyle = "#fff"
  g.font = font(900, 64)
  g.shadowColor = "rgba(255,122,217,.8)"
  g.shadowBlur = 24
  g.fillText(
    items.length > 1 ? `ガチャ ${items.length}連の結果` : "ガチャの結果",
    WIDTH / 2,
    110,
  )
  g.shadowBlur = 0

  // カード
  const isSingle = items.length === 1
  const cols = isSingle ? 1 : 5
  const rows = Math.ceil(items.length / cols)
  const gap = 22
  const areaTop = 190
  const areaBottom = HEIGHT - 230
  const cardW = isSingle ? 460 : (WIDTH - 80 - gap * (cols - 1)) / cols
  const cardH = Math.min(
    cardW * 1.43,
    (areaBottom - areaTop - gap * (rows - 1)) / rows,
  )
  const gridH = rows * cardH + (rows - 1) * gap
  const startY = areaTop + (areaBottom - areaTop - gridH) / 2
  sorted.forEach((item, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const inRow = Math.min(cols, items.length - row * cols)
    const rowW = inRow * cardW + (inRow - 1) * gap
    const x = (WIDTH - rowW) / 2 + col * (cardW + gap)
    const y = startY + row * (cardH + gap)
    const rank = gachaRarityRank(item.rarity)
    const r = isSingle ? 28 : 16

    // 枠（SSR 以上は光らせる）
    const frame = g.createLinearGradient(x, y, x + cardW, y + cardH)
    FRAME_COLORS[item.rarity].forEach((color, i, list) =>
      frame.addColorStop(i / (list.length - 1), color),
    )
    if (rank >= 3) {
      g.shadowColor = FRAME_COLORS[item.rarity][1]
      g.shadowBlur = 30
    }
    g.fillStyle = frame
    roundRect(g, x, y, cardW, cardH, r)
    g.fill()
    g.shadowBlur = 0
    const pad = isSingle ? 8 : 5
    g.fillStyle = "rgba(15,23,42,.92)"
    roundRect(g, x + pad, y + pad, cardW - pad * 2, cardH - pad * 2, r - 4)
    g.fill()

    // レア度
    const badgeSize = isSingle ? 34 : 22
    g.font = font(900, badgeSize)
    const badgeW = g.measureText(item.rarity).width + badgeSize
    g.fillStyle = BADGE_COLOR[item.rarity]
    roundRect(g, x + pad + 8, y + pad + 8, badgeW, badgeSize * 1.4, badgeSize)
    g.fill()
    g.fillStyle = "#fff"
    g.fillText(
      item.rarity,
      x + pad + 8 + badgeW / 2,
      y + pad + 8 + badgeSize * 0.72,
    )

    // 絵
    const image = images[index]
    const nameH = isSingle ? 70 : 40
    if (image) {
      drawContain(
        g,
        image,
        x + pad + 8,
        y + pad + badgeSize * 1.4 + 16,
        cardW - pad * 2 - 16,
        cardH - pad * 2 - badgeSize * 1.4 - nameH - 20,
      )
    }

    // 名前
    g.fillStyle = "#fff"
    g.font = font(700, isSingle ? 34 : 19)
    g.fillText(
      fitText(g, item.name, cardW - pad * 2 - 12),
      x + cardW / 2,
      y + cardH - pad - nameH / 2,
    )

    if (item.isNew) {
      g.font = font(900, isSingle ? 30 : 18)
      const newW = g.measureText("NEW").width + 18
      g.fillStyle = "#ec4899"
      roundRect(
        g,
        x + cardW - pad - newW - 6,
        y + pad + 8,
        newW,
        isSingle ? 42 : 28,
        20,
      )
      g.fill()
      g.fillStyle = "#fff"
      g.fillText(
        "NEW",
        x + cardW - pad - newW / 2 - 6,
        y + pad + 8 + (isSingle ? 21 : 14),
      )
    }
  })

  // ぴくたーちゃんとサイト名
  if (pictor) drawContain(g, pictor, 60, HEIGHT - 220, 200, 200)
  g.textAlign = "left"
  g.fillStyle = "#fff"
  g.font = font(900, 54)
  g.fillText("Aipictors", 290, HEIGHT - 135)
  g.font = font(500, 30)
  g.fillStyle = "rgba(255,255,255,.75)"
  g.fillText("aipictors.com", 292, HEIGHT - 80)

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
}

/** 共有する文（いちばん上のレア度の景品を書く） */
export function gachaShareText(items: readonly GachaItem[]): string {
  const best = [...items].sort(
    (a, b) => gachaRarityRank(b.rarity) - gachaRarityRank(a.rarity),
  )[0]
  const head =
    items.length > 1
      ? `Aipictorsのガチャ${items.length}連を引いたよ！`
      : "Aipictorsのガチャを引いたよ！"
  const body = best ? `${best.rarity}「${best.name}」が出た✨` : ""
  return `${head}${body}\n#Aipictors #ぴくたーガチャ`
}

/**
 * 共有する。共有シートがあれば画像つきで開く。なければ画像を保存して X の投稿画面を開く。
 * 押した瞬間に呼ぶこと（画像は先に作っておく）
 */
export async function shareGachaResult(
  items: readonly GachaItem[],
  image: Blob | null,
): Promise<"shared" | "fallback" | "cancelled"> {
  const text = gachaShareText(items)
  const file = image
    ? new File([image], "aipictors-gacha.png", { type: "image/png" })
    : null
  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, url: SITE_URL })
      return "shared"
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled"
      }
    }
  }
  if (file) {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(file)
    link.download = file.name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(link.href), 10_000)
  }
  const intent = new URL("https://x.com/intent/post")
  intent.searchParams.set("text", text)
  intent.searchParams.set("url", SITE_URL)
  window.open(intent.toString(), "_blank", "noopener,noreferrer")
  return "fallback"
}
