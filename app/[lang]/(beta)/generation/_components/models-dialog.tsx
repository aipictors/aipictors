"use client"

import type { ImageModelsQuery } from "@/__generated__/apollo"
import { ImageModelCard } from "@/app/[lang]/(beta)/generation/_components/image-model-card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type Props = {
  isOpen: boolean
  onClose(): void
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  onSelect(id: string): void
}

export const ModelsDialog = (props: Props) => {
  return (
    <Sheet
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          props.onClose()
        }
      }}
      open={props.isOpen}
    >
      <SheetContent side={"bottom"}>
        <SheetHeader>
          <SheetTitle>{"モデル選択"}</SheetTitle>
        </SheetHeader>
        {/* <p>{"美少女イラスト"}</p>
          <p>{"美男子イラスト"}</p>
          <p>{"グラビア"}</p>
          <p>{"背景"}</p>
          <p>{"獣系"}</p> */}
        <ScrollArea className="h-72">
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
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
        <SheetFooter className="justify-center">
          <Button
            onClick={() => {
              props.onClose()
            }}
            className="rounded-full"
          >
            {"OK"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
