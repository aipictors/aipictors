import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { config, META } from "~/config"
import { AchievementsPage } from "~/routes/($lang)._main.achievements._index/components/achievements-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.ACHIEVEMENTS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

/**
 * 実績（?user=ユーザーID で他の人の実績、?highlight=キー でその実績を開く）
 */
export default function Achievements() {
  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AchievementsPage />
    </Suspense>
  )
}
