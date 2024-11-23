import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { SettingAdvertisementsForm } from "~/routes/($lang).settings.advertisements/_components/setting-advertisements-form"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_ADVERTISEMENTS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingAdvertisements() {
  return <SettingAdvertisementsForm />
}
