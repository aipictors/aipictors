"use client"

import { SearchConfigDialog } from "@/[lang]/(main)/search/_components/search-config-dialog"
import { Button } from "@/_components/ui/button"
import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"
import { useBoolean } from "usehooks-ts"

export const SearchHeader = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-center">
          <p className="font-bold text-lg">{"＃タグの検索結果（1234件）"}</p>
        </div>
        <div className="flex space-x-2">
          <p>{"検索トップ"}</p>
          <p className="text-sm">{">検索結果"}</p>
        </div>
        <div className="flex">
          <Button onClick={onOpen}>{"詳細検索設定"}</Button>
        </div>
        <div className="flex space-x-2">
          <Label>{"ぼかしを外す"}</Label>
          <Switch />
          <Label>{"ダイアログ"}</Label>
          <Switch />
        </div>
      </div>
      <SearchConfigDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
