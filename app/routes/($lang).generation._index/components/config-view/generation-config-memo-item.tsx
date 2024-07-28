import { GenerationMemoItemContents } from "@/routes/($lang).generation._index/components/config-view/generation-memo-item-contents"

type Props = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  memo: any
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
