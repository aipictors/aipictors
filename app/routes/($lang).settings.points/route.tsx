import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { PointsSettingsForm } from "~/routes/($lang).settings.points/components/points-settings-form"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ACCOUNT, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingsPointsPage() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("ポイント", "Points")} />
      </div>
      <PointsSettingsForm />
    </div>
  )
}
