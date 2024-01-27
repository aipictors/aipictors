"use client"

import { LoraImageModelCard } from "@/app/[lang]/(beta)/generation/_components/lora-image-model-card"
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
  selectedModelIds: string[]
  onSelect(id: string): void
}

export const LoraModelsDialog = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>LoRAを追加</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"LoRA選択"}</DialogTitle>
        </DialogHeader>
        <LoraImageModelCard
          models={props.models}
          selectedModelIds={props.selectedModelIds}
          onSelect={props.onSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
