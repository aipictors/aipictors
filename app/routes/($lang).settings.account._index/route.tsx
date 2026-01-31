import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { AccountNavigation } from "~/routes/($lang).settings.account._index/components/account-navigation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ACCOUNT, undefined, props.params.lang)
}

/**
 * アカウント
 */
export default function Account () {
  return <AccountNavigation />
}
