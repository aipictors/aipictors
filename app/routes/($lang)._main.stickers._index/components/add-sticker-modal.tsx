import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const AddStickerModal = (props: Props) => {
  return (
    <Dialog
      onOpenChange={() => {
        props.onClose()
      }}
      open={props.isOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"スタンプ公開"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          <p>{"非公開の作成済みスタンプ"}</p>
          <div className="flex">
            <img alt={""} className="h-9 w-9" src="gibbresh.png" />
            <img alt="" className="h-9 w-9" src="gibbresh.png" />
          </div>
          <p>{"選択スタンプ"}</p>
          <img alt="" className="h-9 w-9" src="gibbresh.png" />
          <p>{"タイトル"}</p>
          <Input placeholder="タイトル" />
          <div className="flex flex-col">
            <p className="py-2">{"ジャンル"}</p>
            <div className="flex space-x-4">
              <div className="items-center space-x-2">
                <Checkbox id="terms" />
                <span>{"人物"}</span>
              </div>
              <div className="items-center space-x-2">
                <Checkbox id="terms" />
                <span>{"動物"}</span>
              </div>
              <div className="items-center space-x-2">
                <Checkbox id="terms" />
                <span>{"機械"}</span>
              </div>
              <div className="items-center space-x-2">
                <Checkbox id="terms" />
                <span>{"背景"}</span>
              </div>
              <div className="items-center space-x-2">
                <Checkbox id="terms" />
                <span>{"物"}</span>
              </div>
            </div>
          </div>
          <p>{"タグ"}</p>
          <div className="flex space-x-4">
            <div className="items-center space-x-2">
              <Checkbox id="terms" />
              <span>{"人物"}</span>
            </div>
            <div className="items-center space-x-2">
              <Checkbox id="terms" />
              <span>{"動物"}</span>
            </div>
            <div className="items-center space-x-2">
              <Checkbox id="terms" />
              <span>{"機械"}</span>
            </div>
            <div className="items-center space-x-2">
              <Checkbox id="terms" />
              <span>{"背景"}</span>
            </div>
            <div className="items-center space-x-2">
              <Checkbox id="terms" />
              <span>{"物"}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button>{"追加"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
