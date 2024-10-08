import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { META } from "~/config"
import { PlanPage } from "~/routes/($lang)._main.generation.plans/components/plans-page"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.GENERATION_PLANS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return json({})
}

/**
 * 画像生成プラン
 */
export default function GenerationPlans() {
  return <PlanPage />
}
