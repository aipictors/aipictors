import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { SettingAdvertisementsForm } from "~/routes/($lang).settings.advertisements/_components/setting-advertisements-form"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ADVERTISEMENTS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
}

export default function SettingAdvertisements() {
  return <SettingAdvertisementsForm />
}
