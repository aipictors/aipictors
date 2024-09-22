import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { AccountPasswordForm } from "~/routes/($lang).settings.account.password/components/setting-password-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    META.SETTINGS_ACCOUNT_PASSWORD,
    undefined,
    props.params.lang,
  )
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function AccountPassword() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("パスワード", "Password")} />
      </div>
      <AccountPasswordForm />
    </div>
  )
}
