"use client"

import { useCachedImageGenerationTask } from "@/app/[lang]/generation/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/app/_components/private-image"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Card } from "@/components/ui/card"
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
