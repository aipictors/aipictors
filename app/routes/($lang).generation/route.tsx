import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { loaderClient } from "~/lib/loader-client"
import { config, META } from "~/config"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { GenerationConfigProvider } from "~/routes/($lang).generation._index/components/generation-config-provider"
import {
  GenerationQueryContextQuery,
  GenerationQueryProvider,
} from "~/routes/($lang).generation._index/components/generation-query-provider"
import { SidebarProvider } from "~/components/sidebar-provider"
import { ApolloError } from "@apollo/client/index"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Outlet, useLoaderData } from "@remix-run/react"
import { Suspense, useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.GENERATION, undefined, props.params.lang)
}

export async function loader() {
  try {
    const result = await loaderClient.query({
      query: GenerationQueryContextQuery,
      variables: {},
    })

    return {
      data: result.data,
    }
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

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

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
    <SidebarProvider>
      <HomeHeader
        alwaysShowTitle={true}
        showPcSheetMenu={true}
        title={t("Aipictors画像生成", "Aipictors Generator")}
      />
      <Suspense fallback={<AppLoadingPage />}>
        <GenerationQueryProvider generationQueryContext={data.data}>
          <GenerationConfigProvider>
            <div className="container max-w-none px-4">
              <Outlet />
            </div>
          </GenerationConfigProvider>
        </GenerationQueryProvider>
      </Suspense>
    </SidebarProvider>
  )
}
