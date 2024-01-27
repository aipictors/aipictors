"use client"

import { GenerationResultBody } from "@/app/[lang]/(beta)/generation/_components/generation-result-body"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Config } from "@/config"
import { useMediaQuery } from "usehooks-ts"

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

export const GenerationResultSheet = (props: Props) => {
  const isDesktop = useMediaQuery(Config.mediaQuery.isDesktop)

  if (isDesktop) {
    // コンポーネントを切り替える
  }

  return (
    <Sheet onOpenChange={props.onClose} open={props.isOpen}>
      <SheetContent side={"left"} className="p-0 flex flex-col gap-0">
        <SheetHeader className="p-4">
          <SheetTitle>{props.taskId}</SheetTitle>
        </SheetHeader>
        <GenerationResultBody
          taskId={props.taskId}
          imageToken={props.imageToken}
          promptText={props.promptText}
          negativePromptText={props.negativePromptText}
          configSeed={props.configSeed}
          configSampler={props.configSampler}
          configScale={props.configScale}
          configSizeType={props.configSizeType}
          configModel={props.configModel}
          configVae={props.configVae}
          isOpen={props.isOpen}
          onClose={props.onClose}
          onUse={props.onUse}
          onChangeRating={props.onChangeRating}
          onOpenInPainting={props.onOpenInPainting}
        />
      </SheetContent>
    </Sheet>
  )
}
