"use client"

import { LoraImageModelList } from "@/app/[lang]/generation/_components/config-view/lora-image-model-list"
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
  models: ImageLoraModelsQuery["imageLoraModels"]
  selectedModelNames: string[]
  availableImageGenerationMaxTasksCount: number
  onSelect(name: string, isAdded: boolean): void
  onClose(): void
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
      <DialogContent className="lg:max-w-screen-lg md:max-w-screen-md xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle className="hidden md:block xl:block">
            {"LoRAを選択"}
          </DialogTitle>
          <DialogDescription>
            <p className="hidden md:block xl:block">
              {"使用するLoRA(エフェクト)を選択してください"}
            </p>
            <p>{`使用できるLoRA数 :${props.selectedModelNames.length}/${props.availableImageGenerationMaxTasksCount}`}</p>
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
