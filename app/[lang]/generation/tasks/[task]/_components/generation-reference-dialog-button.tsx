"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  onReference(): void
  onReferenceWithSeed(): void
  children: React.ReactNode
}

/**
 * 参照生成ダイアログ
 * @param props
 * @returns
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
              復元
            </Button>
            <Button
              onClick={props.onReferenceWithSeed}
              variant={"secondary"}
              size={"sm"}
            >
              復元（Seed込み）
            </Button>
          </div>
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
