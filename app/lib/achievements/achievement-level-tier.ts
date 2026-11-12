/**
 * 実績レベルの段階（レベルの幅ごとに印の形と色を変える）
 * レベルは 10 * (level - 1)^2 ポイントで上がるので、上の段階ほど幅を広くする
 */
export type AchievementLevelTier = {
  key: string
  /** この段階になるレベル */
  minLevel: number
  name: string
  enName: string
  shape: "sprout" | "shield" | "gem" | "crown"
  /** 印のグラデーション（上・下） */
  colors: [string, string]
}

export const ACHIEVEMENT_LEVEL_TIERS: AchievementLevelTier[] = [
  {
    key: "sprout",
    minLevel: 1,
    name: "若葉",
    enName: "Sprout",
    shape: "sprout",
    colors: ["#86efac", "#16a34a"],
  },
  {
    key: "bronze",
    minLevel: 5,
    name: "ブロンズ",
    enName: "Bronze",
    shape: "shield",
    colors: ["#f4b183", "#a0522d"],
  },
  {
    key: "silver",
    minLevel: 10,
    name: "シルバー",
    enName: "Silver",
    shape: "shield",
    colors: ["#f1f5f9", "#7c8796"],
  },
  {
    key: "gold",
    minLevel: 15,
    name: "ゴールド",
    enName: "Gold",
    shape: "shield",
    colors: ["#fde68a", "#d97706"],
  },
  {
    key: "sapphire",
    minLevel: 20,
    name: "サファイア",
    enName: "Sapphire",
    shape: "gem",
    colors: ["#93c5fd", "#1d4ed8"],
  },
  {
    key: "amethyst",
    minLevel: 30,
    name: "アメジスト",
    enName: "Amethyst",
    shape: "gem",
    colors: ["#d8b4fe", "#7e22ce"],
  },
  {
    key: "ruby",
    minLevel: 40,
    name: "ルビー",
    enName: "Ruby",
    shape: "gem",
    colors: ["#fda4af", "#be123c"],
  },
  {
    key: "diamond",
    minLevel: 50,
    name: "ダイヤモンド",
    enName: "Diamond",
    shape: "gem",
    colors: ["#cffafe", "#0891b2"],
  },
  {
    key: "crown",
    minLevel: 60,
    name: "クラウン",
    enName: "Crown",
    shape: "crown",
    colors: ["#fef08a", "#ca8a04"],
  },
  {
    key: "legend",
    minLevel: 80,
    name: "レジェンド",
    enName: "Legend",
    shape: "crown",
    colors: ["#f9a8d4", "#7c3aed"],
  },
]

/**
 * レベルの段階と、次の段階（いちばん上なら null）
 */
export function toAchievementLevelTier(level: number) {
  let index = 0
  for (let i = 0; i < ACHIEVEMENT_LEVEL_TIERS.length; i++) {
    if (level >= ACHIEVEMENT_LEVEL_TIERS[i].minLevel) index = i
  }
  return {
    tier: ACHIEVEMENT_LEVEL_TIERS[index],
    next: ACHIEVEMENT_LEVEL_TIERS[index + 1] ?? null,
    index,
  }
}
