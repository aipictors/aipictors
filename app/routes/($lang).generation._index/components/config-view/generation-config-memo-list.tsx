import { useEffect, useState } from "react"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { GenerationConfigMemoItem } from "~/routes/($lang).generation._index/components/config-view/generation-config-memo-item"

type Props = {
  memos: unknown[] | undefined
  refetchMemos: () => void
}

type Memo = {
  title?: string | null
  explanation?: string | null
  prompts?: string | null
  model?: unknown
}

/**
 * 履歴メモ一覧
 */
export function GenerationConfigMemoList(props: Props) {
  const [searchWord, setSearchWord] = useState("")

  const toRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === "object") {
      return value as Record<string, unknown>
    }
    return {}
  }

  useEffect(() => {
    if (props.memos === undefined) return
    props.refetchMemos()
  }, [props.memos, props.refetchMemos])

  if (props.memos === undefined) {
    return <>{"プリセットから設定を復元できます"}</>
  }

  const isMemo = (value: unknown): value is Memo => {
    return Boolean(value) && typeof value === "object"
  }

  const memos = props.memos.filter(isMemo)

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
                    ...toRecord(memo.model),
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
