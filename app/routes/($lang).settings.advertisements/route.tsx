import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { SettingAdvertisementsForm } from "~/routes/($lang).settings.advertisements/_components/setting-advertisements-form"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_ADVERTISEMENTS)
}

export default function SettingAdvertisements() {
  return <SettingAdvertisementsForm />
}
