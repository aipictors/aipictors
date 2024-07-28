import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  children: React.ReactNode
  isShowControlNetCaption: boolean
  onReference(): void
  onReferenceWithSeed(): void
}

/**
 * 参照生成ダイアログ
 */
export function GenerationReferenceDialog(props: Props) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>復元</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              onClick={props.onReference}
              variant={"secondary"}
              size={"sm"}
            >
              再利用
            </Button>
            <Button
              onClick={props.onReferenceWithSeed}
              variant={"secondary"}
              size={"sm"}
            >
              再利用（Seed込み）
            </Button>
          </div>
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
