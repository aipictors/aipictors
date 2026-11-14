/**
 * 「ぴくたーちゃんラン」のステージの名前と長さ。
 * 画面（three.js を読み込まない側）からも使うので、ステージの作りとは別のファイルにしている
 */

/** 1 つのステージの長さ（m） */
export const PICTOR_RUN_STAGE_LENGTH = 80

/**
 * ステージ（走る順）。id は絵や曲のファイルに付けている番号で、あとから足したステージは大きい番号になる
 * （順番を入れ替えても、ファイルの名前は変えなくてよい）
 */
export const PICTOR_RUN_STAGES: readonly {
  id: number
  ja: string
  en: string
}[] = [
  { id: 1, ja: "はじまりの草原", en: "Meadow of Beginnings" },
  { id: 14, ja: "じゃがいも畑", en: "Potato Field" },
  { id: 2, ja: "さくら並木", en: "Cherry Blossom Lane" },
  { id: 3, ja: "まぶしい海辺", en: "Sunny Beach" },
  { id: 4, ja: "夕やけの砂漠", en: "Sunset Desert" },
  { id: 5, ja: "きのこの森", en: "Mushroom Forest" },
  { id: 6, ja: "雪の村", en: "Snow Village" },
  { id: 7, ja: "夜のネオン街", en: "Neon City" },
  { id: 15, ja: "デジタルワールド", en: "Digital World" },
  { id: 8, ja: "おかしの国", en: "Candy Land" },
  { id: 9, ja: "紅葉の里", en: "Autumn Village" },
  { id: 10, ja: "海の底", en: "Under the Sea" },
  { id: 11, ja: "溶岩の火山", en: "Lava Volcano" },
  { id: 12, ja: "星の世界", en: "Starry Space" },
  { id: 13, ja: "空の美術館", en: "Sky Gallery" },
]

/** ステージの絵のファイル名に付ける番号（2 けた） */
export const toPictorRunStageFile = (stage: { id: number }) =>
  String(stage.id).padStart(2, "0")

/** 走る順に並べ替える（items は id の順 = 作った順に並んだもの） */
export const inPictorRunStageOrder = <T>(items: readonly T[]): T[] =>
  PICTOR_RUN_STAGES.map((stage) => items[stage.id - 1])

/** 走った距離から、今いるステージ（0 始まりの通し番号。1 周したあとも数え続ける） */
export const toPictorRunStage = (distance: number) =>
  Math.max(0, Math.floor(distance / PICTOR_RUN_STAGE_LENGTH))

export const toPictorRunStageName = (stage: number) =>
  PICTOR_RUN_STAGES[stage % PICTOR_RUN_STAGES.length]
