import { SettingRequestForm } from "~/routes/($lang).settings.request/components/setting-request-form"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"

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
