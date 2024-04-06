"use client"

import { useCachedImageGenerationTask } from "@/[lang]/generation/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/_components/private-image"
import { Card } from "@/_components/ui/card"
import { AuthContext } from "@/_contexts/auth-context"
import { useContext } from "react"

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
