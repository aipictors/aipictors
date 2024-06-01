import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"

type Props = {
  onReference(): void
  children: React.ReactNode
  isShowControlNetCaption: boolean
}

/**
 * 参照生成ダイアログボタン
 */
export function GenerationReferenceDialogButton(props: Props) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>復元</DialogTitle>
          </DialogHeader>
          <Button>復元</Button>
          <Button>復元（Seed込み）</Button>
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
