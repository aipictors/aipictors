"use client"

import { GenerationConfigMemoItem } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-item"

/**
 * 履歴メモ一覧
 * @param props
 * @returns
 */
export const GenerationConfigMemoList = () => {
  return (
    <>
      {"メモ一覧"}
      {"メモから設定を復元できます"}
      <GenerationConfigMemoItem />
      <GenerationConfigMemoItem />
      <GenerationConfigMemoItem />
      <GenerationConfigMemoItem />
    </>
  )
}
