import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { SettingRequestForm } from "~/routes/($lang).settings.request/components/setting-request-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_SUPPORT)
}

export default function SettingRequest() {
  return (
    <>
      <div className="w-full space-y-4">
        <div className="block md:hidden">
          <SettingsHeader title={"サポートを受け取る"} />
        </div>
        <div className="space-y-4">
          <SettingRequestForm />
        </div>
      </div>
    </>
  )
}
