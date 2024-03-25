import { SettingRequestForm } from "@/app/[lang]/settings/request/_components/account-request-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const SettingRequestPage = async () => {
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

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default SettingRequestPage
