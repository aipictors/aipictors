import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { CreatorRewardsPage } from "~/routes/($lang).settings.creator-rewards/components/creator-rewards-page"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_CREATOR_REWARDS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingsCreatorRewardsPage() {
  const t = useTranslation()
  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("クリエイター報酬", "Creator Rewards")} />
      </div>
      <CreatorRewardsPage />
    </div>
  )
}
