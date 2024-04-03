import { AccountLogoutForm } from "@/app/[lang]/account/logout/_components/account-logout-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const AccountLoginPage = async () => {
  return (
    <AppPageCenter>
      <AccountLogoutForm />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default AccountLoginPage
