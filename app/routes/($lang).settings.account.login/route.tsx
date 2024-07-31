import { AccountLoginForm } from "~/routes/($lang).settings.account.login/components/account-login-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

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
