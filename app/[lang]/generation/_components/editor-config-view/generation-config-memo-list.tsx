"use client"

import { GenerationConfigMemoItem } from "@/app/[lang]/generation/_components/editor-config-view/generation-config-memo-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageGenerationMemosQuery } from "@/graphql/__generated__/graphql"

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

  return (
    <>
      {"メモから設定を復元できます"}
      <ScrollArea className="h-full p-4">
        {props.memos?.imageGenerationMemos.map(
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
