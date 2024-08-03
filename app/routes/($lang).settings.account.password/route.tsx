import { AccountPasswordForm } from "~/routes/($lang).settings.account.password/components/setting-password-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

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
