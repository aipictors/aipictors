"use client"

import { generationDataContext } from "@/app/[lang]/generation/_contexts/generation-data-context"
import { GenerationEditorContext } from "@/app/[lang]/generation/_contexts/generation-editor-context"
import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

export const GenerationEditorContextProvider = (props: Props) => {
  const dataContext = useContext(generationDataContext)

  const cacheStorage = new ImageGenerationCache({
    passType: dataContext.currentPass?.type ?? null,
    userNanoId: dataContext.user?.nanoid ?? null,
  })

  return (
    <GenerationEditorContext.Provider
      options={{ input: cacheStorage.restore() }}
    >
      {props.children}
    </GenerationEditorContext.Provider>
  )
}
