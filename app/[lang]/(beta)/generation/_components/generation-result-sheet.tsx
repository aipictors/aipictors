"use client"

import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { config } from "@/config"
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
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  if (isDesktop) {
    // コンポーネントを切り替える
  }

  return (
    <SheetContent side={"left"} className="p-0 flex flex-col gap-0">
      <SheetHeader className="p-4">
        <SheetTitle>{props.taskId}</SheetTitle>
      </SheetHeader>
    </SheetContent>
  )
}
