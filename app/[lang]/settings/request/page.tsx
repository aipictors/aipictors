import { SettingRequestForm } from "@/app/[lang]/settings/request/_components/account-request-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const SettingRequestPage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <h1 className="font-bold text-2xl">{"支援リクエスト"}</h1>
        <div className="space-y-4">
          <SettingRequestForm />
        </div>
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingRequestPage
