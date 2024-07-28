import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CheckIcon } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const SearchConfigDialog = (props: Props) => {
  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={() => {
        props.onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"詳細検索設定"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span>{"年齢制限："}</span>
            <Button>
              <CheckIcon className="mr-2" />
              {"全年齢"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"作品形式："}</span>
            <Button>
              <CheckIcon className="mr-2" />
              {"全年齢"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"検索対象："}</span>
            <Button>
              <CheckIcon className="mr-2" />
              {"全年齢"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"使用AI："}</span>
            <Input placeholder={"タグ名"} className="max-w-lg" />
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"使用モデル："}</span>
            <Input placeholder={"タグ名"} className="max-w-lg" />
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"使用サービス："}</span>
            <Input placeholder={"タグ名"} className="max-w-lg" />
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"プロンプト公開："}</span>
            <Button>
              <CheckIcon className="mr-2" />
              {"全年齢"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"フォロー関係："}</span>
            <Button>
              <CheckIcon className="mr-2" />
              {"全年齢"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"お題参加："}</span>
            <Button>
              <CheckIcon className="mr-2" />
              {"全年齢"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"テイスト："}</span>
            <Button className="rounded-full">
              <CheckIcon className="mr-2" />
              <span>{"全年齢"}</span>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"投稿日："}</span>
            <span>{"開始日："}</span>
            <Input placeholder="Select Date and Time" type="datetime-local" />
            <span>{"終了日："}</span>
            <Input placeholder="Select Date and Time" type="datetime-local" />
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"表示順："}</span>
            <Button className="rounded-full">
              <CheckIcon className="mr-2" />
              <span>{"全年齢"}</span>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center space-x-2">
            <span>{"投稿件数："}</span>
            <Button className="rounded-full">
              <CheckIcon className="mr-2" />
              <span>{"全年齢"}</span>
            </Button>
          </div>
          <Separator />
        </div>
        <DialogFooter>
          <Button>{"検索"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
