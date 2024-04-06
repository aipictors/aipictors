import { AccountLoginForm } from "@/[lang]/account/login/_components/account-login-form"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

const AccountLoginPage = async () => {
  return (
    <AppPageCenter>
      <p className="font-bold text-2xl leading-none">ユーザID</p>
      <AccountLoginForm />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default AccountLoginPage
