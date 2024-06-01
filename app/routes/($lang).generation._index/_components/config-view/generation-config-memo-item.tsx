import type { ImageGenerationMemoNode } from "@/_graphql/__generated__/graphql"
import { GenerationMemoItemContents } from "@/routes/($lang).generation._index/_components/config-view/generation-memo-item-contents"

type Props = {
  memo: ImageGenerationMemoNode
  refetchMemos: () => void
}

/**
 * 履歴メモ単体
 */
export const GenerationConfigMemoItem = (props: Props) => {
  if (props.memo === undefined) return null

  return (
    <>
      <div className="relative flex items-center">
        <GenerationMemoItemContents
          memo={props.memo}
          refetchMemos={props.refetchMemos}
        />
      </div>
    </>
  )
}
