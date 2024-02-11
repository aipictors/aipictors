"use client"

import { LoraImageModelsList } from "@/app/[lang]/(beta)/generation/_components/lora-image-models-list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ImageLoraModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  isOpen: boolean
  onClose(): void
  models: ImageLoraModelsQuery["imageLoraModels"]
  selectedModelNames: string[]
  onSelect(name: string, isAdded: boolean): void
}

export const LoraModelsDialogButton = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"} className="w-full" variant={"secondary"}>
          LoRAを追加
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"LoRA選択"}</DialogTitle>
        </DialogHeader>
        <LoraImageModelsList
          models={props.models}
          selectedModelNames={props.selectedModelNames}
          onSelect={props.onSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
