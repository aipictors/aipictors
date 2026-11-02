import { useTranslation } from "~/hooks/use-translation"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { SettingAdvertisementsForm } from "~/routes/($lang).settings.advertisements/_components/setting-advertisements-form"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ADVERTISEMENTS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingAdvertisements () {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("広告設定", "Advertisement Settings")} />
      </div>
      <SettingAdvertisementsForm />
    </div>
  )
}
