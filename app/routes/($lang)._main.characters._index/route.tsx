import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { CharacterGenerationForm } from "~/routes/($lang)._main.characters._index/components/character-generation-form"
import { CharacterList } from "./components/character-list"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { VIEWER_TOKEN_QUERY } from "./queries"

export const meta: MetaFunction = () => {
  return [
    { title: "キャラクター表情生成 - Aipictors" },
    {
      name: "description",
      content: "AIでキャラクターの表情差分を生成しましょう",
    },
  ]
}

export default function CharactersIndex () {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const { data: viewer, loading } = useQuery(VIEWER_TOKEN_QUERY, {
    skip: authContext.isNotLoggedIn,
  })

  if (authContext.isLoading || loading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">
            {t("キャラクター表情生成", "Character Expression Generation")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "この機能を使用するにはログインが必要です",
              "Please log in to use this feature",
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl">
            {t("キャラクター表情生成", "Character Expression Generation")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "アップロードした画像からキャラクターの様々な表情を生成できます",
              "Generate various character expressions from uploaded images",
            )}
          </p>
        </div>

        <CharacterGenerationForm
          userToken={viewer?.viewer?.token}
          userId={authContext.userId}
        />

        <CharacterList
          userId={authContext.userId}
          userToken={viewer?.viewer?.token}
        />
      </div>
    </div>
  )
}
