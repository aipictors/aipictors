import { SettingRestrictionForm } from "app/[lang]/settings/restriction/_components/AccountRestrictionForm"
import { MainCenterPage } from "app/_components/page/MainCenterPage"
import type { Metadata } from "next"

const SettingRestrictionPage = async () => {
  return (
    <MainCenterPage>
      <SettingRestrictionForm />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default SettingRestrictionPage
