import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { loaderClient } from "~/lib/loader-client"
import { config } from "~/config"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { GenerationConfigProvider } from "~/routes/($lang).generation._index/components/generation-config-provider"
import {
  GenerationQueryContextQuery,
  GenerationQueryProvider,
} from "~/routes/($lang).generation._index/components/generation-query-provider"
import { ApolloError } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet, json, useLoaderData } from "@remix-run/react"
import { Suspense, useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"

export const meta: MetaFunction = () => {
  const metaTitle = "無料AIイラスト生成 - スマホ対応"

  const metaDescription =
    "無料で画像生成することができます。1日無料10枚でたくさん生成できます。LoRA、ControlNetにも対応、多数のモデルからお気に入りのイラストを生成できます。生成した画像はすぐに投稿したり、自由に利用したりすることができます。"

  const metaImage = `${config.siteURL}/opengraph-image.jpg`

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export async function loader() {
  try {
    const result = await loaderClient.query({
      query: GenerationQueryContextQuery,
      variables: {},
    })

    return json(result.data, {
      headers: {
        "Cache-Control": config.cacheControl.short,
      },
    })
  } catch (error) {
    if (error instanceof ApolloError) {
      throw new Response(error.message, { status: 500 })
    }
    if (error instanceof Error) {
      throw new Response(error.message, { status: 500 })
    }
    throw new Response("ERROR", { status: 500 })
  }
}

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function GenerationLayout() {
  const t = useTranslation()

  const data = useLoaderData<typeof loader>()

  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  return (
    <>
      <HomeHeader title={t("Aipictors画像生成", "Aipictors Generator")} />
      <Suspense fallback={<AppLoadingPage />}>
        <GenerationQueryProvider generationQueryContext={data}>
          <GenerationConfigProvider>
            <div className="container max-w-none px-8">
              <Outlet />
            </div>
          </GenerationConfigProvider>
        </GenerationQueryProvider>
      </Suspense>
    </>
  )
}
