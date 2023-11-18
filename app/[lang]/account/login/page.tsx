import { AccountLoginForm } from "@/app/[lang]/account/login/_components/account-login-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const AccountLoginPage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <p className="leading-none font-bold text-2xl">ユーザID</p>
        <AccountLoginForm />
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountLoginPage
