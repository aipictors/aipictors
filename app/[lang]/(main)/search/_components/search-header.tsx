import { SearchConfigDialog } from "@/app/[lang]/(main)/search/_components/search-config-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useBoolean } from "usehooks-ts"

export const SearchHeader = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-center">
          <p className="text-lg font-bold">{"＃タグの検索結果（1234件）"}</p>
        </div>
        <div className="flex space-x-2">
          <p>{"検索トップ"}</p>
          <p className="text-sm">{">検索結果"}</p>
        </div>
        <div className="flex">
          <Button onClick={onOpen}>{"詳細検索設定"}</Button>
        </div>
        <div className="flex space-x-2">
          <p>{"ぼかしを外す"}</p>
          <Switch />
          <p>{"ダイアログ"}</p>
          <Switch />
        </div>
      </div>
      <SearchConfigDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
