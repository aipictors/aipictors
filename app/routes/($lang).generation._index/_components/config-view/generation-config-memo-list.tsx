import { Input } from "@/_components/ui/input"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { GenerationConfigMemoItem } from "@/routes/($lang).generation._index/_components/config-view/generation-config-memo-item"
import { useEffect, useState } from "react"

type Props = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  memos: any[] | undefined
  refetchMemos: () => void
}

/**
 * 履歴メモ一覧
 */
export const GenerationConfigMemoList = (props: Props) => {
  if (props.memos === undefined) {
    return <>{"プリセットから設定を復元できます"}</>
  }

  const [searchWord, setSearchWord] = useState("")

  useEffect(() => {
    props.refetchMemos()
  }, [])

  const filterModels =
    searchWord !== ""
      ? props.memos.filter((memo) => {
          return (
            memo?.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
            memo?.explanation
              ?.toLowerCase()
              .includes(searchWord.toLowerCase()) ||
            memo?.prompts?.toLowerCase().includes(searchWord.toLowerCase())
          )
        })
      : props.memos

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
