import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { AccountLoginForm } from "~/routes/($lang).settings.account.login/components/account-login-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_LOGIN)
}

export default function AccountLogin() {
  return (
    <>
      <div className="w-full space-y-4">
        <div className="block md:hidden">
          <SettingsHeader title={"ユーザID"} />
        </div>
        <AccountLoginForm />
      </div>
    </>
  )
}
