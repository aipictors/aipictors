import { AccountLoginForm } from "@/app/[lang]/account/login/_components/account-login-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const AccountLoginPage = async () => {
  return (
    <AppPageCenter>
      <p className="leading-none font-bold text-2xl">ユーザID</p>
      <AccountLoginForm />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountLoginPage
