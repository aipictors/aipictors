"use client"

import { Card } from "@/_components/ui/card"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"

/**
 * 作品プレビュー内容
 * @param props
 * @returns
 */
export const GenerationWorkContentPreview = () => {
  const context = useGenerationContext()

  const previewImageURL = context.config.previewImageURL

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        <div className="m-auto max-h-[100vh]">
          <img src={previewImageURL} className={"max-h-[64vh]"} alt={"-"} />
        </div>
      </Card>
    </>
  )
}
