"use client"

import type { ImageLoraModelsQuery } from "@/graphql/__generated__/graphql"
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
      open={props.isOpen}
      onOpenChange={(isOpen) => {
        props.onClose()
      }}
    >
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"LoRA選択"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-96">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
