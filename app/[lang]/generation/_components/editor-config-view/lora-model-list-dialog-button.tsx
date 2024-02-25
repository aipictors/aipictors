"use client"

import { LoraImageModelList } from "@/app/[lang]/generation/_components/editor-config-view/lora-image-model-list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export const LoraModelListDialogButton = (props: Props) => {
  const { value, setTrue, setFalse } = useBoolean()

  return (
    <Dialog
      open={value}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setFalse()
      }}
    >
      <DialogTrigger asChild className="w-full">
        <Button
          size={"sm"}
          className="w-full"
          variant={"secondary"}
          onClick={setTrue}
        >
          {"LoRA（エフェクト）を追加"}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"LoRAを選択"}</DialogTitle>
          <DialogDescription>
            {"使用するLoRA(エフェクト)を選択してください"}
          </DialogDescription>
        </DialogHeader>
        <LoraImageModelList
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
