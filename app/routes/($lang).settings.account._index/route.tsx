import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { AccountSettingsContainer } from "~/routes/($lang).settings.account._index/components/account-settings-container"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ACCOUNT, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * アカウント
 */
export default function Account() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("アカウント設定", "Account Settings")} />
      </div>
      <AccountSettingsContainer />
    </div>
  )
}
