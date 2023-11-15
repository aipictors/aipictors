"use client"

import { InPaintingSelectedPromptDialog } from "@/app/[lang]/(beta)/generation/_components/in-painting-selected-prompt-dialog"
import { StarRating } from "@/app/[lang]/(beta)/generation/_components/star-rating"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { useDisclosure } from "@chakra-ui/react"
import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose(): void
  onChangeRating(value: number): void
  onOpenInPainting(): void
}

export const SelectedWorkDialog = (props: Props) => {
  const {
    isOpen: isPromptOpen,
    onOpen: onPromptOpen,
    onClose: onPromptClose,
  } = useDisclosure()

  const [rating, setRating] = useState(0)

  return (
    <>
      <Sheet
        // onClose={props.onClose}
        open={props.isOpen}
      >
        <SheetContent>
          <SheetHeader>
            <div>
              <img src="https://source.unsplash.com/random/800x600" alt="" />
              <p>
                {
                  "選んだプロンプトたち：masterpiece, best quality, extremely detailed, anime, girl, skirt, donut, braids,"
                }
              </p>
              <Button
                onClick={() => {
                  onPromptOpen()
                  props.onClose()
                }}
              >
                {"more"}
              </Button>
              <div className="flex flex-col">
                <div className="flex">
                  <Button
                    onClick={() => {
                      alert("再利用します")
                    }}
                  >
                    {"再利用"}
                  </Button>
                  <Button
                    onClick={() => {
                      alert("DLします")
                    }}
                  >
                    {"DL"}
                  </Button>
                  <Button>{"投稿"}</Button>
                  <Button onClick={props.onOpenInPainting}>{"一部修正"}</Button>
                  <Button
                    onClick={() => {
                      alert("生成情報付きのURLをコピーしました")
                    }}
                  >
                    {"URL"}
                  </Button>
                </div>
              </div>
              <StarRating
                value={rating}
                onChange={(value) => {
                  setRating(value)
                  props.onChangeRating(value)
                }}
              />
            </div>
          </SheetHeader>
          <div>
            <Button
              onClick={() => {
                props.onClose()
              }}
            >
              {"OK"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <InPaintingSelectedPromptDialog
        isOpen={isPromptOpen}
        onClose={onPromptClose}
      />
    </>
  )
}
