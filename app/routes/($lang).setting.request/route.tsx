import { SettingRequestForm } from "@/[lang]/settings/request/_components/account-request-form"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function SettingRequest() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <h1 className="font-bold text-2xl">{"支援リクエスト"}</h1>
        <div className="space-y-4">
          <SettingRequestForm />
        </div>
      </div>
    </AppPageCenter>
  )
}
