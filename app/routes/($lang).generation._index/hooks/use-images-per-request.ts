import { useLocalStorage } from "usehooks-ts"

/**
 * 1 回の生成で作る枚数の希望（null はまとめて＝上限）
 */
export function useImagesPerRequestPreference() {
  return useLocalStorage<number | null>("generation.imagesPerRequest", null)
}

/**
 * Seed を指定しているときの枚数の希望（既定は 1 枚）
 * 履歴から Seed ごと復元したときに、いつもの「まとめて」で枚数分のコインを使わないように別にしておく
 */
export function useFixedSeedImagesPerRequestPreference() {
  return useLocalStorage<number | null>(
    "generation.imagesPerRequest.fixedSeed",
    1,
  )
}
