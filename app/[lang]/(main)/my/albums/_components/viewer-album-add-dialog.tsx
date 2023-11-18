"use client"

import { TitleWorkList } from "@/app/[lang]/(main)/my/albums/_components/title-work-list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const ViewerAlbumAddDialog = (props: Props) => {
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          props.onClose()
        }
      }}
      open={props.isOpen}
    >
      <DialogContent>
        <DialogHeader />
        <div className="flex">
          <div className="flex flex-col">
            <div className="flex">
              <p>{"シリーズ新規作成"}</p>
            </div>
            <div className="flex flex-col">
              <p>{"サムネイル画像:32MB以内 PNG、JPEG対象"}</p>
              <Button>
                <img src="https://source.unsplash.com/random/800x600" alt="" />
              </Button>
            </div>
            <div className="flex flex-col">
              <p>{"シリーズ名"}</p>
              <Input placeholder="シリーズ名" />
              <p>{"リンク名（英数字のみ）"}</p>
              <Input placeholder="リンク名" />
              <p className="text-xs">{`https://aipictors.com/series?user=36604&id=${""}`}</p>
              <p>{"説明"}</p>
              <Textarea placeholder="説明" />
            </div>
            <div className="flex flex-col">
              <p>{"シリーズ名"}</p>
              <RadioGroup defaultValue="1">
                <div className="flex">
                  <RadioGroupItem value="1" />
                  <Label htmlFor="r1">{"全年齢"}</Label>
                </div>
                <div className="flex">
                  <RadioGroupItem value="2">{"性的描写あり"}</RadioGroupItem>
                  <Label htmlFor="r2">{"性的描写あり"}</Label>
                </div>
                <div className="flex">
                  <RadioGroupItem value="3">{"R-18"}</RadioGroupItem>
                  <Label htmlFor="r3">{"R-18"}</Label>
                </div>
                <div className="flex">
                  <RadioGroupItem value="4">{"R-18G"}</RadioGroupItem>
                  <Label htmlFor="r4">{"R-18G"}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col">
              <p>{"投稿済み作品一覧"}</p>
              <TitleWorkList />
            </div>
            <div className="flex flex-col">
              <p>{"選択済み作品一覧"}</p>
              <TitleWorkList />
            </div>
            <div className="flex flex-col">
              <Button
                // colorScheme="primary"
                onClick={() => {
                  alert("投稿しました")
                  props.onClose()
                }}
              >
                {"保存"}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
