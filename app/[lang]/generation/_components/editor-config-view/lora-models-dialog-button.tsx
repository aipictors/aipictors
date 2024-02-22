"use client"

import { LoraImageModelsList } from "@/app/[lang]/generation/_components/editor-config-view/lora-image-models-list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ImageLoraModelsQuery } from "@/graphql/__generated__/graphql"
import { useBoolean } from "usehooks-ts"

type Props = {
  isOpen: boolean
  onClose(): void
  models: ImageLoraModelsQuery["imageLoraModels"]
  selectedModelNames: string[]
  onSelect(name: string, isAdded: boolean): void
}

export const LoraModelsDialogButton = (props: Props) => {
  const { value, setTrue, setFalse } = useBoolean()

  return (
    <Dialog open={value}>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          className="w-full"
          variant={"secondary"}
          onClick={setTrue}
        >
          LoRAを追加
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"LoRA選択"}</DialogTitle>
        </DialogHeader>
        <LoraImageModelsList
          models={props.models.map((model) => ({
            ...model,
            genre: model.genre || "その他",
          }))}
          selectedModelNames={props.selectedModelNames}
          onSelect={props.onSelect}
        />
        <DialogFooter>
          <Button className="w-full" onClick={setFalse}>
            {"完了"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
