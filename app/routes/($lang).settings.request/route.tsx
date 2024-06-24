import { AppPageCenter } from "@/_components/app/app-page-center"
import { SettingRequestForm } from "@/routes/($lang).settings.request/_components/setting-request-form"

export default function SettingRequest() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <h1 className="font-bold text-2xl">{"サポートを受け取る"}</h1>
        <div className="space-y-4">
          <SettingRequestForm />
        </div>
      </div>
    </AppPageCenter>
  )
}
