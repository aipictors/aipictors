/**
 * ガチャの景品一覧（app/components/gacha/gacha-prizes.ts）を、枠の定義から書き出す。
 * アイコン枠: scripts/avatar-frames/decorations.mjs の gachaOnly な枠
 * ヘッダー枠: scripts/header-frames/header-frames.mjs の HEADER_FRAMES
 * reserve の枠は inPool: false（作ってあるが、いまのガチャには入れない）
 *
 * 使い方: node scripts/gacha/build-gacha-prizes.mjs
 */
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { DECORATIONS } from "../avatar-frames/decorations.mjs"
import { HEADER_FRAMES } from "../header-frames/header-frames.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const RANK = { UUR: -1, UR: 0, SSR: 1, SR: 2, R: 3, N: 4 }

const prizes = [
  ...DECORATIONS.filter((item) => item.gachaOnly).map((item) => ({
    id: `icon:${item.slug}`,
    kind: "ICON_FRAME",
    slug: item.slug,
    rarity: item.rarity,
    name: item.name,
    description: item.description,
    imageUrl: `/avatar-frames/deco/${item.slug}.webp`,
    inPool: !item.reserve,
  })),
  ...HEADER_FRAMES.map((item) => ({
    id: `header:${item.slug}`,
    kind: "HEADER_FRAME",
    slug: item.slug,
    rarity: item.rarity,
    name: item.name,
    description: item.description,
    imageUrl: `/header-frames/${item.slug}.pc.webp`,
    inPool: !item.reserve,
  })),
].sort(
  (a, b) =>
    RANK[a.rarity] - RANK[b.rarity] ||
    a.kind.localeCompare(b.kind) ||
    a.slug.localeCompare(b.slug),
)

const body = `// scripts/gacha/build-gacha-prizes.mjs で書き出したファイル。手で直さず、枠の定義を直して書き出し直す
import type { GachaRarity } from "~/components/gacha/gacha-direction"

export type GachaPrizeKind = "ICON_FRAME" | "HEADER_FRAME"

export type GachaPrize = {
  id: string
  kind: GachaPrizeKind
  slug: string
  rarity: GachaRarity
  name: string
  description: string
  imageUrl: string
  /** false: 作ってあるが、いまのガチャには入れない */
  inPool: boolean
}

export const GACHA_PRIZES: readonly GachaPrize[] = ${JSON.stringify(prizes, null, 2)}
`

writeFileSync(join(root, "app/components/gacha/gacha-prizes.ts"), body)
console.log(`${prizes.length} prizes (${prizes.filter((p) => p.inPool).length} in pool)`)
