import { useLocalStorage } from "usehooks-ts"

const STORAGE_KEY = "generation.faceFix"

/**
 * 顔の自動修正（生成した画像の顔を見つけて描き直す。ADetailer 相当）。ほかの生成設定と同じく localStorage に覚える
 */
export function useGenerationFaceFix() {
  const [stored, setStored] = useLocalStorage<boolean>(STORAGE_KEY, false, {
    initializeWithValue: false,
  })

  return [stored === true, (value: boolean) => setStored(value)] as const
}
