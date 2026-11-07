import { AppLoadingPage } from "~/components/app/app-loading-page"
import { loaderClient } from "~/lib/loader-client"
import { config, META } from "~/config"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { GenerationConfigProvider } from "~/routes/($lang).generation._index/components/generation-config-provider"
import {
  GenerationQueryContextQuery,
  GenerationQueryProvider,
} from "~/routes/($lang).generation._index/components/generation-query-provider"
import { SidebarProvider } from "~/components/sidebar-provider"
import { isApolloError } from "@apollo/client/errors"
import {
  type HeadersFunction,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { Outlet, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import {
  GENERATION_MAINTENANCE_KV_KEY,
  readMaintenanceFlag,
  toPublicMaintenanceFlag,
} from "~/lib/maintenance-mode"
import {
  GenerationMaintenanceBanner,
  GenerationNoticeProvider,
} from "~/routes/($lang).generation._index/components/submission-view/generation-notice"

export const meta: MetaFunction = (props) => {
  return createMeta(META.GENERATION, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  try {
    // 画像生成のメンテナンス（KV の maintenance:generation、docs/maintenance-mode.md）
    const [result, generationMaintenance] = await Promise.all([
      loaderClient.query({
        query: GenerationQueryContextQuery,
        variables: {},
      }),
      readMaintenanceFlag(
        props.context.cloudflare?.env,
        GENERATION_MAINTENANCE_KV_KEY,
      ),
    ])

    return json(
      {
        data: result.data,
        generationMaintenance: toPublicMaintenanceFlag(generationMaintenance),
      },
      // メンテナンス中の画面は拠点のキャッシュに置かない（終わったあとに帯が残らないように）
      generationMaintenance.enabled
        ? { headers: { "Cache-Control": "no-store" } }
        : undefined,
    )
  } catch (error) {
    if (error instanceof Error && isApolloError(error)) {
      throw new Response(error.message, { status: 500 })
    }
    if (error instanceof Error) {
      throw new Response(error.message, { status: 500 })
    }
    throw new Response("ERROR", { status: 500 })
  }
}

export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control":
    loaderHeaders.get("Cache-Control") ?? config.cacheControl.oneDay,
})

export function HydrateFallback () {
  return <AppLoadingPage />
}

export default function GenerationLayout () {
  const t = useTranslation()

  const data = useLoaderData<typeof loader>()

  // ログイン状態の確認（Firebase の初期化）を待たずに画面を出す。
  // 以前は確認が終わるまで読み込み中の表示だけを出していて、生成画面が出るまで数秒かかっていた（LCP 5.8 秒）。
  // ログインが必要な操作は、それぞれの部品がログイン状態を見て切り替える

  return (
    <SidebarProvider>
      <HomeHeader
        alwaysShowTitle={true}
        showPcSheetMenu={true}
        title={t("Aipictors画像生成", "Aipictors Generator")}
      />
      <GenerationNoticeProvider initialMaintenance={data.generationMaintenance}>
        <GenerationMaintenanceBanner />
        <Suspense fallback={<AppLoadingPage />}>
          <GenerationQueryProvider generationQueryContext={data.data}>
            <GenerationConfigProvider>
              <div className="container max-w-none px-4">
                <Outlet />
              </div>
            </GenerationConfigProvider>
          </GenerationQueryProvider>
        </Suspense>
      </GenerationNoticeProvider>
    </SidebarProvider>
  )
}
