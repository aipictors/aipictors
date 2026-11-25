import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { ORIGINAL_WORK_TAG_NAMES } from "~/routes/($lang)._main._index/utils/original-work-tags"

const STORAGE_KEY = "aipictors-home-original-only"

type OriginalOnlyState = {
  isOriginalOnly: boolean
  setIsOriginalOnly: (value: boolean) => void
}

/**
 * ホームの「オリジナルのみ」。ホームのページの中だけで有効（他のページの一覧は既定のオフのまま）
 */
export const HomeOriginalOnlyContext = createContext<OriginalOnlyState>({
  isOriginalOnly: false,
  setIsOriginalOnly: () => {},
})

/**
 * 「オリジナルのみ」の状態（ブラウザに保存。ログインは要らない）。
 * サーバーの描画とハイドレーションでは常にオフ、その後で保存した値に変える
 */
export function useOriginalOnlyState(): OriginalOnlyState {
  const [isOriginalOnly, setState] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") setState(true)
    } catch {
      // 保存領域を使えないブラウザではオフのまま
    }
  }, [])

  const setIsOriginalOnly = useCallback((value: boolean) => {
    setState(value)
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, "true")
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // 保存できなくてもこの画面では効かせる
    }
  }, [])

  return { isOriginalOnly, setIsOriginalOnly }
}

export function useHomeOriginalOnly() {
  return useContext(HomeOriginalOnlyContext)
}

/**
 * works の where に足す条件（オンのときだけ tagNames を付ける）
 */
export function originalOnlyWhere(isOriginalOnly: boolean) {
  return isOriginalOnly ? { tagNames: ORIGINAL_WORK_TAG_NAMES } : {}
}
