"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { GenerationDataContext } from "@/app/[lang]/generation/_contexts/generation-data-context"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { GenerationConfigCache } from "@/app/[lang]/generation/_machines/models/generation-config-cache"
import { AuthContext } from "@/app/_contexts/auth-context"
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

  const { data: viewer, refetch } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const userNanoid = viewer?.viewer?.user.nanoid ?? null

  useEffect(() => {
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [userNanoid])

  useEffect(() => {
    if (authContext.isLoading) return
    if (authContext.isNotLoggedIn) return
    // ログイン状態が変わったら再取得
    refetch()
  }, [authContext.isLoggedIn])

  const cacheStorage = new GenerationConfigCache()

  // if (authContext.isLoading) {
  //   return <AppLoadingPage />
  // }

  // if (authContext.isNotLoggedIn) {
  //   return <LoginPage />
  // }

  return (
    <GenerationDataContext.Provider
      value={{
        promptCategories: props.promptCategories,
        models: props.imageModels,
        loraModels: props.imageLoraModels,
        user: viewer?.viewer?.user ?? null,
        currentPass: viewer?.viewer?.currentPass ?? null,
      }}
    >
      <GenerationConfigContext.Provider
        options={{ input: cacheStorage.restore() }}
      >
        {props.children}
      </GenerationConfigContext.Provider>
    </GenerationDataContext.Provider>
  )
}
