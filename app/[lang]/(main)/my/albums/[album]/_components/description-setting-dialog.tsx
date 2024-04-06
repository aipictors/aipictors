"use client"

import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const DescriptionSettingDialog = (props: Props) => {
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
          <DialogTitle>{"Modal Title"}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button
            //  colorScheme="blue"
            onClick={props.onClose}
          >
            {" Close"}
          </Button>
          <Button variant="ghost">{"Secondary Action"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
