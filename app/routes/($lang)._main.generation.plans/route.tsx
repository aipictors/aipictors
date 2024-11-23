import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { config, META } from "~/config"
import { PlanPage } from "~/routes/($lang)._main.generation.plans/components/plans-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.GENERATION_PLANS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * 画像生成プラン
 */
export default function GenerationPlans() {
  return <PlanPage />
}
