"use client"

import type { ImageModelsQuery } from "@/__generated__/apollo"
import { ImageModelCard } from "@/app/[lang]/(beta)/generation/_components/image-model-card"
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
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  onSelect(id: string): void
}

export const ModelsDialog = (props: Props) => {
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          props.onClose()
        }
      }}
      open={props.isOpen}
    >
      <DialogContent className="md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
        <DialogHeader>
          <DialogTitle>{"モデル選択"}</DialogTitle>
        </DialogHeader>
        {/* <p>{"美少女イラスト"}</p>
          <p>{"美男子イラスト"}</p>
          <p>{"グラビア"}</p>
          <p>{"背景"}</p>
          <p>{"獣系"}</p> */}
        <ScrollArea className="h-full max-h-96">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {props.models.map((imageModel) => {
              return (
                <ImageModelCard
                  key={imageModel.id}
                  onSelect={() => {
                    props.onSelect(imageModel.id)
                  }}
                  name={imageModel.displayName ?? ""}
                  imageURL={imageModel.thumbnailImageURL ?? ""}
                  isActive={props.selectedModelId === imageModel.id}
                />
              )
            })}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={() => {
              props.onClose()
            }}
          >
            {"OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
