"use client"

import { GenerationMemoItemContents } from "@/app/[lang]/generation/_components/editor-config-view/generation-memo-item-contents"
import { ImageGenerationMemoNode } from "@/graphql/__generated__/graphql"

type Props = {
  memo: ImageGenerationMemoNode
  refetchMemos: () => void
}

/**
 * 履歴メモ単体
 * @param props
 * @returns
 */
export const GenerationConfigMemoItem = (props: Props) => {
  if (props.memo === undefined) return null

  return (
    <>
      <div className="relative items-center flex">
        <GenerationMemoItemContents
          memo={props.memo}
          refetchMemos={props.refetchMemos}
        />
      </div>
    </>
  )
}
