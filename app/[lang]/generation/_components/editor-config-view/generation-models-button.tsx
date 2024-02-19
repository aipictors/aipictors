"use client"

import { ImageModelsList } from "@/app/[lang]/generation/_components/editor-config-view/generation-image-model-list"
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
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { useBoolean } from "usehooks-ts"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  onSelect(id: string, type: string): void
}

export const GenerationModelsButton = (props: Props) => {
  const { value, setTrue, setFalse } = useBoolean()

  const onSelectModel = (id: string, type: string) => {
    props.onSelect(id, type)
    setFalse()
  }

  return (
    <Dialog
      open={value}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        setFalse()
      }}
    >
      <DialogTrigger>
        <Button
          size={"sm"}
          className="w-full"
          variant={"secondary"}
          onClick={setTrue}
        >
          {"すべてのモデル"}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"モデルを選択"}</DialogTitle>
          <DialogDescription>
            {"使用するモデルを選択してください"}
          </DialogDescription>
        </DialogHeader>
        <ImageModelsList
          models={props.models}
          onSelect={onSelectModel}
          selectedModelId={props.selectedModelId}
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
