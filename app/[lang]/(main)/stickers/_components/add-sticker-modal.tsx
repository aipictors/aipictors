import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
        <div className="flex flex-col">
          <p>{"非公開の作成済みスタンプ"}</p>
          <div className="flex">
            <img alt={""} className="w-9 h-9" src="gibbresh.png" />
            <img alt="" className="w-9 h-9" src="gibbresh.png" />
          </div>
          <p>{"選択スタンプ"}</p>
          <img alt="" className="w-9 h-9" src="gibbresh.png" />
          <p>{"タイトル"}</p>
          <input className="border-2 border-gray-300" placeholder="タイトル" />
          <div className="flex flex-col">
            <p>{"ジャンル"}</p>
            <div className="flex space-x-4">
              <input type="checkbox" className="text-blue-500" /> 人物
              <input type="checkbox" className="text-blue-500" /> 動物
              <input type="checkbox" className="text-blue-500" /> 機械
              <input type="checkbox" className="text-blue-500" /> 背景
              <input type="checkbox" className="text-blue-500" /> 物
            </div>
          </div>
          <p>{"タグ"}</p>
          <div className="flex">
            <input type="checkbox" className="text-blue-500" /> 楽しい
            <input type="checkbox" className="text-blue-500" /> 嬉しい
            <input type="checkbox" className="text-blue-500" /> お祝い
            <input type="checkbox" className="text-blue-500" /> 悲しい
            <input type="checkbox" className="text-blue-500" /> その他
          </div>
        </div>
        <DialogFooter>
          <Button>{"追加"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
