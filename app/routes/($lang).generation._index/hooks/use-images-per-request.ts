import { useLocalStorage } from "usehooks-ts"

/**
 * 1 回の生成で作る枚数の希望（null はまとめて＝上限）
 */
export function useImagesPerRequestPreference() {
  return useLocalStorage<number | null>("generation.imagesPerRequest", null)
}
