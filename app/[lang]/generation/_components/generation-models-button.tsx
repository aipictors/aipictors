"use client"

import { ImageModelsList } from "@/app/[lang]/generation/_components/image-models-list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ImageModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  onSelect(id: string, type: string): void
}

export const GenerationModelsButton = (props: Props) => {
  const onSelectModel = (id: string, type: string) => {
    props.onSelect(id, type)
    if (props.onClose) {
      props.onClose()
    }
  }

  return (
    <>
      <Button
        onClick={props.onOpen}
        size={"sm"}
        className="w-full"
        variant={"secondary"}
      >
        {"すべてのモデル"}
      </Button>

      <Dialog
        onOpenChange={(isOpen) => {
          if (!isOpen && props.onClose) {
            props.onClose()
          }
        }}
        open={props.isOpen}
      >
        <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
          <DialogHeader>
            <DialogTitle>{"モデルを選択"}</DialogTitle>
            <DialogDescription>
              使用するモデルを選択してください
            </DialogDescription>
          </DialogHeader>
          <ImageModelsList
            models={props.models}
            onSelect={onSelectModel}
            selectedModelId={props.selectedModelId}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
