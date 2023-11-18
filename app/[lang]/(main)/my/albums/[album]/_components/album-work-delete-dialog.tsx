"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const AlbumWorkDeleteDialog = (props: Props) => {
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
        <DialogHeader>
          <DialogDescription>
            {"選択した作品を削除しますか？"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            // colorScheme="blue"
            onClick={() => {
              props.onClose()
              alert("削除しました")
            }}
          >
            {"OK"}
          </Button>
          <Button onClick={props.onClose}>{"やめる"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
