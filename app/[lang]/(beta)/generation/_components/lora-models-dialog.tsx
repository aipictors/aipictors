"use client"

import type { ImageLoraModelsQuery } from "@/__generated__/apollo"
import { LoraImageModelCard } from "@/app/[lang]/(beta)/generation/_components/lora-image-model-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  isOpen: boolean
  onClose(): void
  models: ImageLoraModelsQuery["imageLoraModels"]
  selectedModelIds: string[]
  onSelect(id: string): void
}

export const LoraModelsDialog = (props: Props) => {
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          props.onClose()
        }
      }}
      open={props.isOpen}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{"LoRA選択"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-72">
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {props.models.map((imageLoraModel) => {
              return (
                <LoraImageModelCard
                  key={imageLoraModel.id}
                  isActive={props.selectedModelIds.includes(imageLoraModel.id)}
                  onSelect={() => {
                    props.onSelect(imageLoraModel.id)
                  }}
                  name={imageLoraModel.name}
                  description={imageLoraModel.description}
                  imageURL={imageLoraModel.thumbnailImageURL}
                />
              )
            })}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={props.onClose}
            // colorScheme="primary"
          >
            {"OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
