import { useSyncExternalStore } from "react"
import {
  readListLikeCountHidden,
  saveListLikeCountHidden,
  subscribeListLikeCountHidden,
} from "~/utils/list-like-count-preference"

/**
 * 作品の一覧でいいね数を隠しているか（端末ごとの設定）
 */
export function useListLikeCountHidden(): [boolean, (value: boolean) => void] {
  const isHidden = useSyncExternalStore(
    subscribeListLikeCountHidden,
    readListLikeCountHidden,
    () => false,
  )

  return [isHidden, saveListLikeCountHidden]
}
