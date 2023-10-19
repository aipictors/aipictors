import { AccountPasswordForm } from "app/[lang]/account/password/_components/SettingPasswordForm"
import { MainCenterPage } from "app/_components/MainCenterPage"
import type { Metadata } from "next"

const AccountPasswordPage = async () => {
  return (
    <MainCenterPage>
      <AccountPasswordForm />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountPasswordPage
