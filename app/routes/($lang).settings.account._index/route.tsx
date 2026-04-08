import type {
  HeadersFunction,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { AccountNavigation } from "~/routes/($lang).settings.account._index/components/account-navigation"
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
export default function Account () {
  return (
    <>
      <div className="hidden md:block">
        <AccountSettingsContainer />
      </div>
      <div className="md:hidden">
        <AccountNavigation />
      </div>
    </>
  )
}
