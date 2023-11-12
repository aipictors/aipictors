import { SettingRequestForm } from "app/[lang]/settings/request/_components/account-request-form"
import { MainCenterPage } from "app/_components/page/main-center-page"
import type { Metadata } from "next"

const SettingRequestPage = async () => {
  return (
    <MainCenterPage>
      <SettingRequestForm />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingRequestPage
