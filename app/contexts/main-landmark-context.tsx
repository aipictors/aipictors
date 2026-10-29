import { createContext, useContext } from "react"

/**
 * すでに <main> の中にいるか。
 * 共通レイアウト（AppContents）がページ本文を <main> で囲むので、その中のページは <main> を重ねない
 * （<main> が無いページ・入れ子になっているページがあり、Lighthouse のユーザー補助で減点されていた）
 */
export const MainLandmarkContext = createContext(false)

export function useIsInsideMain(): boolean {
  return useContext(MainLandmarkContext)
}
