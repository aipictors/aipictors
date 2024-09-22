import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { SettingRequestForm } from "~/routes/($lang).settings.request/components/setting-request-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_SUPPORT, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function SettingRequest() {
  const t = useTranslation()

  return (
    <>
      <div className="w-full space-y-4">
        <div className="block md:hidden">
          <SettingsHeader title={t("サポートを受け取る", "Receive Support")} />
        </div>
        <div className="space-y-4">
          <SettingRequestForm />
        </div>
      </div>
    </>
  )
}
