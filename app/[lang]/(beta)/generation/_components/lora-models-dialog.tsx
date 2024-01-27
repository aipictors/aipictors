"use client"

import { LoraImageModelsList } from "@/app/[lang]/(beta)/generation/_components/lora-image-models-list"
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
  selectedModelIds: string[]
  onSelect(id: string): void
  children: React.ReactNode
}

export const LoraModelsDialog = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"LoRA選択"}</DialogTitle>
        </DialogHeader>
        <LoraImageModelsList
          models={props.models}
          selectedModelIds={props.selectedModelIds}
          onSelect={props.onSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
