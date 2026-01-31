import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { useState } from "react"

type Props = {
  onReference(): void
  children: React.ReactNode
  isShowControlNetCaption: boolean
}

/**
 * 参照生成ダイアログボタン
 */
export function GenerationReferenceDialogButton (props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReference = () => {
    props.onReference()
    setIsOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>復元</DialogTitle>
          </DialogHeader>
          <Button onClick={handleReference}>復元</Button>
          <Button onClick={handleReference}>復元（Seed込み）</Button>
          {props.isShowControlNetCaption && (
            <div className="mt-2">
              <p className="text-gray-500 text-sm">
                {"※ControlNetの設定は復元されません。"}
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose>
              <Button>{"閉じる"}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
