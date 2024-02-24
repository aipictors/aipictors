"use client"

import { generationDataContext } from "@/app/[lang]/generation/_contexts/generation-data-context"
import { GenerationEditorContext } from "@/app/[lang]/generation/_contexts/generation-editor-context"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"
import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useQuery } from "@apollo/client"
import { useContext, useEffect } from "react"

type Props = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageModels: ImageModelsQuery["imageModels"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  children: React.ReactNode
}

export const GenerationContextProvider = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: viewer, refetch } = useQuery(viewerCurrentPassQuery)

  useEffect(() => {
    const userNanoid = viewer?.viewer?.user.nanoid ?? null
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [])

  useEffect(() => {
    console.log("authContext.isLoggedIn", authContext.isLoggedIn)
    if (authContext.isNotLoggedIn) return
    // ログイン状態が変わったら再取得
    refetch()
  }, [authContext.isLoggedIn])

  const cacheStorage = new ImageGenerationCache()

  // TODO: いつか消す
  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  // TODO: いつか消す
  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return (
    <generationDataContext.Provider
      value={{
        promptCategories: props.promptCategories,
        models: props.imageModels,
        loraModels: props.imageLoraModels,
        user: viewer?.viewer?.user ?? null,
        currentPass: viewer?.viewer?.currentPass ?? null,
      }}
    >
      <GenerationEditorContext.Provider
        options={{ input: cacheStorage.restore() }}
      >
        {props.children}
      </GenerationEditorContext.Provider>
    </generationDataContext.Provider>
  )
}
