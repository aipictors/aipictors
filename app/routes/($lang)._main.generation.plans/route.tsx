import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { PlanPage } from "~/routes/($lang)._main.generation.plans/components/plans-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.GENERATION_PLANS)
}

/**
 * 画像生成プラン
 */
export default function GenerationPlans() {
  return <PlanPage />
}
