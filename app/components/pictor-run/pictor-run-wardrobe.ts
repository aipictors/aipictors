/**
 * ミニゲーム「ぴくたーちゃんラン」のきせかえ。
 * 走って集めたコインをためて、ぼうし・せなかのかざり・服の色を買い、身につける。
 * ためたコインと買ったものは、この端末（localStorage）に覚える。
 * 身につけているものはロビーの通信で送り、ほかの人の画面にも出る
 */

export type PictorRunWardrobeSlot = "head" | "back" | "shirt" | "skirt"

export const PICTOR_RUN_WARDROBE_SLOTS: readonly {
  slot: PictorRunWardrobeSlot
  ja: string
  en: string
}[] = [
  { slot: "head", ja: "あたま", en: "Head" },
  { slot: "back", ja: "せなか", en: "Back" },
  { slot: "shirt", ja: "シャツ", en: "Shirt" },
  { slot: "skirt", ja: "スカート", en: "Skirt" },
]

export type PictorRunWardrobeItem = {
  /** 通信と保存に使う名前（英小文字と数字。変えない） */
  id: string
  slot: PictorRunWardrobeSlot
  icon: string
  ja: string
  en: string
  price: number
  /** 服の色（シャツ・スカート）。一覧の色見本にも使う */
  color?: number
}

export const PICTOR_RUN_WARDROBE_ITEMS: readonly PictorRunWardrobeItem[] = [
  {
    id: "ribbon",
    slot: "head",
    icon: "🎀",
    ja: "リボン",
    en: "Ribbon",
    price: 30,
  },
  {
    id: "catears",
    slot: "head",
    icon: "🐱",
    ja: "ねこみみ",
    en: "Cat ears",
    price: 100,
  },
  {
    id: "hat",
    slot: "head",
    icon: "🧙",
    ja: "とんがりぼうし",
    en: "Pointy hat",
    price: 120,
  },
  {
    id: "halo",
    slot: "head",
    icon: "😇",
    ja: "てんしのわ",
    en: "Halo",
    price: 300,
  },
  {
    id: "crown",
    slot: "head",
    icon: "👑",
    ja: "おうかん",
    en: "Crown",
    price: 500,
  },
  {
    id: "bag",
    slot: "back",
    icon: "🎒",
    ja: "ランドセル",
    en: "School bag",
    price: 150,
  },
  {
    id: "wings",
    slot: "back",
    icon: "🪽",
    ja: "てんしのはね",
    en: "Angel wings",
    price: 300,
  },
  {
    id: "s-pink",
    slot: "shirt",
    icon: "👚",
    ja: "ピンクのシャツ",
    en: "Pink shirt",
    price: 50,
    color: 0xffa9c6,
  },
  {
    id: "s-sky",
    slot: "shirt",
    icon: "👕",
    ja: "みずいろのシャツ",
    en: "Sky blue shirt",
    price: 50,
    color: 0x9fd4ff,
  },
  {
    id: "s-lemon",
    slot: "shirt",
    icon: "👕",
    ja: "レモンのシャツ",
    en: "Lemon shirt",
    price: 50,
    color: 0xffe98a,
  },
  {
    id: "s-mint",
    slot: "shirt",
    icon: "👕",
    ja: "ミントのシャツ",
    en: "Mint shirt",
    price: 50,
    color: 0xa6ecc8,
  },
  {
    id: "s-black",
    slot: "shirt",
    icon: "👕",
    ja: "くろいシャツ",
    en: "Black shirt",
    price: 80,
    color: 0x4a4a58,
  },
  {
    id: "k-red",
    slot: "skirt",
    icon: "👗",
    ja: "あかいスカート",
    en: "Red skirt",
    price: 50,
    color: 0xd8434f,
  },
  {
    id: "k-pink",
    slot: "skirt",
    icon: "👗",
    ja: "ピンクのスカート",
    en: "Pink skirt",
    price: 50,
    color: 0xff8fb4,
  },
  {
    id: "k-green",
    slot: "skirt",
    icon: "👗",
    ja: "みどりのスカート",
    en: "Green skirt",
    price: 50,
    color: 0x3f9a6a,
  },
  {
    id: "k-beige",
    slot: "skirt",
    icon: "👗",
    ja: "ベージュのスカート",
    en: "Beige skirt",
    price: 50,
    color: 0xd9bf94,
  },
]

/** 身につけているもの（場所ごとに 1 つ。なにもなければ null） */
export type PictorRunOutfit = Record<PictorRunWardrobeSlot, string | null>

export const PICTOR_RUN_EMPTY_OUTFIT: PictorRunOutfit = {
  head: null,
  back: null,
  shirt: null,
  skirt: null,
}

export type PictorRunWardrobe = {
  /** ためたコイン */
  coins: number
  /** 買ったもの */
  owned: string[]
  outfit: PictorRunOutfit
}

const WARDROBE_KEY = "pictor-run-wardrobe"

const findItem = (id: unknown) =>
  PICTOR_RUN_WARDROBE_ITEMS.find((item) => item.id === id) ?? null

/** 通信で送る形（あたま,せなか,シャツ,スカート の順。ないところは空） */
export function encodePictorRunOutfit(outfit: PictorRunOutfit): string {
  return PICTOR_RUN_WARDROBE_SLOTS.map(({ slot }) => outfit[slot] ?? "").join(
    ",",
  )
}

/** 通信で届いたものを読む（知らないもの・場所のちがうものは捨てる） */
export function decodePictorRunOutfit(value: string | null): PictorRunOutfit {
  const ids = (value ?? "").split(",")
  const outfit = { ...PICTOR_RUN_EMPTY_OUTFIT }
  PICTOR_RUN_WARDROBE_SLOTS.forEach(({ slot }, index) => {
    const item = findItem(ids[index])
    if (item?.slot === slot) outfit[slot] = item.id
  })
  return outfit
}

export function loadPictorRunWardrobe(): PictorRunWardrobe {
  const empty: PictorRunWardrobe = {
    coins: 0,
    owned: [],
    outfit: { ...PICTOR_RUN_EMPTY_OUTFIT },
  }
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(WARDROBE_KEY) ?? "null",
    ) as Partial<PictorRunWardrobe> | null
    if (!saved) return empty
    const owned = (Array.isArray(saved.owned) ? saved.owned : []).filter(
      (id) => findItem(id) !== null,
    )
    const outfit = { ...PICTOR_RUN_EMPTY_OUTFIT }
    for (const { slot } of PICTOR_RUN_WARDROBE_SLOTS) {
      const id = saved.outfit?.[slot]
      // 持っているものだけ、身につけられる
      if (id && owned.includes(id) && findItem(id)?.slot === slot) {
        outfit[slot] = id
      }
    }
    return {
      coins: Math.max(0, Math.floor(Number(saved.coins) || 0)),
      owned,
      outfit,
    }
  } catch {
    return empty
  }
}

export function savePictorRunWardrobe(wardrobe: PictorRunWardrobe): void {
  try {
    window.localStorage.setItem(WARDROBE_KEY, JSON.stringify(wardrobe))
  } catch {
    // 保存できなくても、この回は使える
  }
}
