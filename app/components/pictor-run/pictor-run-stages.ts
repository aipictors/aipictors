/**
 * 「ぴくたーちゃんラン」のステージの名前と長さ。
 * 画面（three.js を読み込まない側）からも使うので、ステージの作りとは別のファイルにしている
 */

/** 1 つのステージの長さ（m） */
export const PICTOR_RUN_STAGE_LENGTH = 80

export const PICTOR_RUN_STAGES: readonly { ja: string; en: string }[] = [
  { ja: "はじまりの草原", en: "Meadow of Beginnings" },
  { ja: "さくら並木", en: "Cherry Blossom Lane" },
  { ja: "まぶしい海辺", en: "Sunny Beach" },
  { ja: "夕やけの砂漠", en: "Sunset Desert" },
  { ja: "きのこの森", en: "Mushroom Forest" },
  { ja: "雪の村", en: "Snow Village" },
  { ja: "夜のネオン街", en: "Neon City" },
  { ja: "おかしの国", en: "Candy Land" },
  { ja: "紅葉の里", en: "Autumn Village" },
  { ja: "海の底", en: "Under the Sea" },
  { ja: "溶岩の火山", en: "Lava Volcano" },
  { ja: "星の世界", en: "Starry Space" },
  { ja: "空の美術館", en: "Sky Gallery" },
]

/** 走った距離から、今いるステージ（0 始まりの通し番号。1 周したあとも数え続ける） */
export const toPictorRunStage = (distance: number) =>
  Math.max(0, Math.floor(distance / PICTOR_RUN_STAGE_LENGTH))

export const toPictorRunStageName = (stage: number) =>
  PICTOR_RUN_STAGES[stage % PICTOR_RUN_STAGES.length]
