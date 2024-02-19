"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const InPaintingSelectedPromptDialog = (props: Props) => {
  return (
    <Dialog onOpenChange={props.onClose} open={props.isOpen}>
      <DialogContent>
        <DialogHeader />
        <div className="flex flex-col">
          <p className="text-lg">{"選択したプロンプト"}</p>
          <div className="flex flex-col">
            <p className="text-xs">{"Model:"}</p>
            <p className="text-xs">{"VAE: "}</p>
            <p className="text-xs">{"Prompts:"}</p>
            <p className="text-xs">{"Negative Prompts: "}</p>
            <p className="text-xs">{"Seed:"}</p>
            <p className="text-xs">{"steps:"}</p>
            <p className="text-xs">{"Scale:"}</p>
            <p className="text-xs">{"Sampler: "}</p>
            <p className="text-xs">{"Width: "}</p>
            <p className="text-xs">{"Height: "}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            // colorScheme="primary"
            onClick={() => {
              props.onClose()
            }}
          >
            {"Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
