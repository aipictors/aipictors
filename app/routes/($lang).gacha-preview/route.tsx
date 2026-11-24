import type { MetaFunction } from "@remix-run/cloudflare"
import { useState } from "react"
import type {
  GachaDirection,
  GachaHint,
  GachaItem,
  GachaRarity,
} from "~/components/gacha/gacha-direction"
import { GachaPerformance } from "~/components/gacha/gacha-performance"

/**
 * ガチャ演出の確認ページ（リンクはしない）。パターンを選んで演出を流せる
 */

export const meta: MetaFunction = () => [
  { title: "ガチャ演出の確認" },
  { name: "robots", content: "noindex" },
]

const FRAMES: Record<string, [GachaRarity, string]> = {
  "gacha-uur-stellar": ["UUR", "天穹の白金星"],
  "gacha-uur-crimson-rose": ["UUR", "紅薔薇の金冠"],
  "gacha-ur-prism-seraph": ["UR", "虹翼の熾天使"],
  "gacha-ur-star-crown": ["UR", "星海の王冠"],
  "gacha-ssr-ice-queen": ["SSR", "氷晶の女王冠"],
  "gacha-ssr-clockwork": ["SSR", "時計仕掛けの金環"],
  "gacha-ssr-pearl-sea": ["SSR", "深海の真珠"],
  "gacha-sr-amethyst": ["SR", "紫水晶の結晶"],
  "gacha-sr-constellation": ["SR", "星座の輪"],
  "gacha-sr-stained-glass": ["SR", "ステンドグラス"],
  "gacha-r-clover": ["R", "四つ葉のクローバー"],
  "gacha-r-shooting-star": ["R", "流れ星"],
  "gacha-r-sunflower": ["R", "ひまわり"],
  "gacha-n-dots": ["N", "水玉リング"],
  "gacha-n-stardust": ["N", "星くずリング"],
  "gacha-n-candy": ["N", "キャンディストライプ"],
}

const toItems = (slugs: string[]): GachaItem[] =>
  slugs.map((slug, i) => ({
    id: `${slug}-${i}`,
    rarity: FRAMES[slug][0],
    name: FRAMES[slug][1],
    imageUrl: `/avatar-frames/deco/${slug}.webp`,
    isNew: i % 3 === 0,
    note: i % 3 === 1 ? "かぶり +30 フリーコイン" : undefined,
  }))

const TEN = [
  "gacha-n-dots",
  "gacha-r-clover",
  "gacha-sr-amethyst",
  "gacha-n-candy",
  "gacha-r-sunflower",
  "gacha-ssr-ice-queen",
  "gacha-n-stardust",
  "gacha-r-shooting-star",
  "gacha-n-dots",
]

const PATTERNS: {
  label: string
  slugs: string[]
  direction?: Partial<GachaDirection> & { hint?: GachaHint }
}[] = [
  {
    label: "1回 N（ふつう）",
    slugs: ["gacha-n-candy"],
    direction: { cutIn: false, promoteTo: null },
  },
  {
    label: "1回 SR（紫）",
    slugs: ["gacha-sr-constellation"],
    direction: {
      hint: "purple",
      promoteTo: null,
      cutIn: false,
    },
  },
  {
    label: "1回 SSR（紫→金に昇格＋確定）",
    slugs: ["gacha-ssr-clockwork"],
    direction: {
      hint: "purple",
      promoteTo: "gold",
      cutIn: true,
    },
  },
  {
    label: "10回 UR（金→虹に昇格＋確定）",
    slugs: [...TEN, "gacha-ur-prism-seraph"],
    direction: {
      hint: "gold",
      promoteTo: "rainbow",
      cutIn: true,
    },
  },
  {
    label: "1回 UUR（虹→白金に昇格＋確定）",
    slugs: ["gacha-uur-stellar"],
    direction: {
      hint: "rainbow",
      promoteTo: "legend",
      cutIn: true,
    },
  },
  {
    label: "10回 UUR（白金＋確定）",
    slugs: [...TEN, "gacha-uur-crimson-rose"],
    direction: {
      hint: "legend",
      promoteTo: null,
      cutIn: true,
    },
  },
  { label: "10回 ランダム（本番と同じ抽選）", slugs: [] },
]

const randomSlugs = () => {
  const pool = Object.keys(FRAMES)
  const weight: Record<GachaRarity, number> = {
    UUR: 0,
    UR: 1,
    SSR: 4,
    SR: 15,
    R: 30,
    N: 50,
  }
  return Array.from({ length: 10 }, () => {
    let r = Math.random() * 100
    for (const rarity of ["UR", "SSR", "SR", "R", "N"] as const) {
      r -= weight[rarity]
      if (r < 0) {
        const candidates = pool.filter((slug) => FRAMES[slug][0] === rarity)
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
    }
    return "gacha-n-dots"
  })
}

export default function GachaPreview() {
  const [playing, setPlaying] = useState<{
    items: GachaItem[]
    direction?: GachaDirection
  } | null>(null)
  return (
    <div className="mx-auto max-w-md space-y-3 p-6">
      <h1 className="font-bold text-xl">ガチャ演出の確認</h1>
      {PATTERNS.map((pattern) => (
        <button
          key={pattern.label}
          type="button"
          className="block w-full rounded-xl border px-4 py-3 text-left font-bold"
          onClick={() => {
            const items = toItems(
              pattern.slugs.length > 0 ? pattern.slugs : randomSlugs(),
            )
            const top = items.reduce((a, b) =>
              ["N", "R", "SR", "SSR", "UR", "UUR"].indexOf(b.rarity) >
              ["N", "R", "SR", "SSR", "UR", "UUR"].indexOf(a.rarity)
                ? b
                : a,
            ).rarity
            setPlaying({
              items,
              direction: pattern.direction
                ? {
                    top,
                    hint: "blue",
                    promoteTo: null,
                    cutIn: false,
                    ...pattern.direction,
                  }
                : undefined,
            })
          }}
        >
          {pattern.label}
        </button>
      ))}
      {playing && (
        <GachaPerformance
          items={playing.items}
          direction={playing.direction}
          onClose={() => setPlaying(null)}
        />
      )}
    </div>
  )
}
