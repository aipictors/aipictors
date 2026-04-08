import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { WithdrawAccountForm } from "~/routes/($lang).settings.account.withdrawal/components/withdraw-account-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    META.SETTINGS_ACCOUNT_WITHDRAWAL,
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function AccountWithdrawal() {
  const t = useTranslation()

  return (
    <div className="w-full space-y-4">
      <div className="block md:hidden">
        <SettingsHeader title={t("退会", "Withdraw Account")} />
      </div>
      <WithdrawAccountForm />
    </div>
  )
}
