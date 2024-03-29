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
  children: React.ReactNode
}

/**
 * 参照生成ダイアログボタン
 * @param props
 * @returns
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
