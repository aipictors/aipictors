import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { AccountLoginForm } from "~/routes/($lang).settings.account.login/components/account-login-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_LOGIN, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function AccountLogin() {
  const t = useTranslation()

  return (
    <>
      <div className="w-full space-y-4">
        <div className="block md:hidden">
          <SettingsHeader title={t("ユーザID", "User Id")} />
        </div>
        <AccountLoginForm />
      </div>
    </>
  )
}
