import { AccountLoginForm } from "app/[lang]/account/login/_components/AccountLoginForm"
import { MainCenterPage } from "app/_components/pages/MainCenterPage"
import type { Metadata } from "next"

const AccountLoginPage = async () => {
  return (
    <MainCenterPage>
      <AccountLoginForm />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountLoginPage
