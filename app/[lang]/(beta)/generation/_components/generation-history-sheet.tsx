"use client"

import { StarRating } from "@/app/[lang]/(beta)/generation/_components/star-rating"
import { PrivateImage } from "@/app/_components/private-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Config } from "@/config"
import { useState } from "react"

type Props = {
  taskId: string
  imageToken: string
  promptText: string
  negativePromptText: string
  configSeed: number
  configSampler: string
  configScale: number
  configSizeType: string
  configModel: string | null
  configVae: string | null
  isOpen: boolean
  onClose(): void
  onUse(): void
  onChangeRating(value: number): void
  onOpenInPainting(): void
}

export const GenerationHistorySheet = (props: Props) => {
  const [rating, setRating] = useState(0)

  return (
    <Sheet onOpenChange={props.onClose} open={props.isOpen}>
      <SheetContent side={"left"} className="flex flex-col gap-y-4">
        <SheetHeader>
          <SheetTitle>{props.taskId}</SheetTitle>
        </SheetHeader>
        <ScrollArea>
          <div className="flex flex-col gap-y-4">
            <PrivateImage
              taskId={props.taskId}
              className={"rounded"}
              alt={props.taskId}
              token={props.imageToken}
            />
            <Button size={"sm"} onClick={props.onUse}>
              {"この設定を復元する"}
            </Button>
            {Config.isDevelopmentMode && (
              <div className="flex gap-x-2">
                <Button
                  size={"sm"}
                  onClick={() => {
                    alert("DLします")
                  }}
                >
                  {"DL"}
                </Button>
                <Button size={"sm"}>{"投稿"}</Button>
                <Button size={"sm"} onClick={props.onOpenInPainting}>
                  {"一部修正"}
                </Button>
                <Button
                  size={"sm"}
                  onClick={() => {
                    alert("生成情報付きのURLをコピーしました")
                  }}
                >
                  {"URL"}
                </Button>
              </div>
            )}
            <StarRating
              value={rating}
              onChange={(value) => {
                setRating(value)
                props.onChangeRating(value)
              }}
            />
            <Card>
              <CardContent className="p-2">
                <pre className="whitespace-pre-wrap">{props.promptText}</pre>
              </CardContent>
            </Card>
            {props.negativePromptText && (
              <Card>
                <CardContent className="p-2">
                  <pre className="whitespace-pre-wrap">
                    {props.negativePromptText}
                  </pre>
                </CardContent>
              </Card>
            )}
            <div className="flex gap-x-4">
              <Badge>{"seed"}</Badge>
              <span>{props.configSeed}</span>
            </div>
            <div className="flex gap-x-4">
              <Badge>{"scale"}</Badge>
              <span>{props.configScale}</span>
            </div>
            <div className="flex gap-x-4">
              <Badge>{"sampler"}</Badge>
              <span>{props.configSampler}</span>
            </div>
            <div className="flex gap-x-4">
              <Badge>{"size"}</Badge>
              <span>{props.configSizeType}</span>
            </div>
            <div className="flex gap-x-4 items-center">
              <Badge>{"model"}</Badge>
              <span className="break-words">{props.configModel}</span>
            </div>
            <div className="flex gap-x-4">
              <Badge>{"VAE"}</Badge>
              <span>{props.configVae}</span>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
