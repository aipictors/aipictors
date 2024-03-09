"use client"

import { GenerationConfigMemoItem } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-item"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ImageGenerationMemosQuery } from "@/graphql/__generated__/graphql"
import { useEffect, useState } from "react"

type Props = {
  memos: ImageGenerationMemosQuery | undefined
  refetchMemos: () => void
}

/**
 * 履歴メモ一覧
 * @param props
 * @returns
 */
export const GenerationConfigMemoList = (props: Props) => {
  if (props.memos === undefined) {
    return <>{"メモから設定を復元できます"}</>
  }

  const [searchWord, setSearchWord] = useState("")

  useEffect(() => {
    props.refetchMemos()
  }, [])

  const filterModels =
    searchWord !== ""
      ? props.memos?.imageGenerationMemos.filter((memo) => {
          return (
            memo?.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
            memo?.explanation
              ?.toLowerCase()
              .includes(searchWord.toLowerCase()) ||
            memo?.prompts?.toLowerCase().includes(searchWord.toLowerCase())
          )
        })
      : props.memos?.imageGenerationMemos

  return (
    <>
      {"メモから設定を復元できます"}
      <Input
        onChange={(event) => {
          setSearchWord(event.target.value)
        }}
        type="text"
        value={searchWord}
        placeholder="タイトル、説明、プロンプトで検索"
      />
      <ScrollArea className="h-full max-h-96 p-4">
        {filterModels.map(
          (memo) =>
            memo && (
              <GenerationConfigMemoItem
                memo={{
                  ...memo,
                  model: {
                    ...memo.model,
                    recommendedPrompt: "",
                  },
                }}
                refetchMemos={props.refetchMemos}
              />
            ),
        )}
      </ScrollArea>
    </>
  )
}
