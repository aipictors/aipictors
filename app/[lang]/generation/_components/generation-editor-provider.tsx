"use client"

import { GenerationEditorContext } from "@/app/[lang]/generation/_contexts/generation-editor-context"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useSuspenseQuery } from "@apollo/client"
import { useEffect } from "react"

type Props = {
  children: React.ReactNode
}

export const GenerationEditorContextProvider = (props: Props) => {
  const { data: viewer } = useSuspenseQuery(viewerCurrentPassQuery, {})

  useEffect(() => {
    const userNanoid = viewer.viewer?.user.nanoid ?? null
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [])

  const cacheStorage = new ImageGenerationCache({
    passType: viewer.viewer?.currentPass?.type ?? null,
    userNanoId: viewer.viewer?.user.nanoid ?? null,
    hasSignedTerms: viewer.viewer?.user.hasSignedImageGenerationTerms ?? false,
  })

  return (
    <GenerationEditorContext.Provider
      options={{ input: cacheStorage.restore() }}
    >
      {props.children}
    </GenerationEditorContext.Provider>
  )
}
