import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { AccountPasswordForm } from "~/routes/($lang).settings.account.password/components/setting-password-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_ACCOUNT_PASSWORD)
}

export default function AccountPassword() {
  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={"パスワード"} />
      </div>
      <AccountPasswordForm />
    </div>
  )
}
