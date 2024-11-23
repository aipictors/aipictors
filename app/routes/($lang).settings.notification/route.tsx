import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingNotificationForm } from "~/routes/($lang).settings.notification/components/setting-notification-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_NOTIFICATION, undefined, props.params.lang)
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
 * 通知設定ページ
 */
export default function SettingNotification() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("通知・いいね", "Notifications & Likes")} />
      </div>
      <SettingNotificationForm />
    </div>
  )
}
