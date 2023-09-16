import { Metadata } from "next"
import { MainSettingRequest } from "app/(main)/settings/request/components/MainSettingRequest"

const SettingRequestPage = async () => {
  return <MainSettingRequest />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SettingRequestPage
