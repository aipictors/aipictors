import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingsNavigation } from "~/routes/($lang).settings._index/components/settings-navigation"
import { SettingNotificationForm } from "~/routes/($lang).settings.notification/components/setting-notification-form"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ACCOUNT, undefined, props.params.lang)
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

/**
 * 設定
 */
export default function Settings () {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="hidden space-y-4 md:block">
        <SettingNotificationForm />
      </div>
      <div className="block md:hidden">
        <h1 className="mb-3 font-bold text-xl">{t("設定", "Settings")}</h1>
        <SettingsNavigation />
      </div>
    </div>
  )
}
