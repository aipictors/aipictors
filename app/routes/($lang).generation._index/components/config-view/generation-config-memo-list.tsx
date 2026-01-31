import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { GenerationConfigMemoItem } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-item"
import { useEffect, useState } from "react"

type Props = {
  memos: unknown[] | undefined
  refetchMemos: () => void
}

/**
 * 履歴メモ一覧
 */
export function GenerationConfigMemoList(props: Props) {
  const [searchWord, setSearchWord] = useState("")

  useEffect(() => {
    if (props.memos === undefined) return
    props.refetchMemos()
  }, [props.memos, props.refetchMemos])

  if (props.memos === undefined) {
    return <>{"プリセットから設定を復元できます"}</>
  }

  const memos = props.memos as Array<{
    title?: string | null
    explanation?: string | null
    prompts?: string | null
    model?: unknown
  }>

  const filterModels =
    searchWord !== ""
      ? memos.filter((memo) => {
          return (
            memo?.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
            memo?.explanation
              ?.toLowerCase()
              .includes(searchWord.toLowerCase()) ||
            memo?.prompts?.toLowerCase().includes(searchWord.toLowerCase())
          )
        })
      : memos

  return (
    <>
      {"プリセットから設定を復元できます"}
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
