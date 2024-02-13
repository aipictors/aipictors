import { AccountPasswordForm } from "@/app/[lang]/account/password/_components/setting-password-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const AccountPasswordPage = async () => {
  return (
    <AppPageCenter className="w-full space-y-8">
      <p className="leading-none font-bold text-2xl">{"パスワード"}</p>
      <AccountPasswordForm />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountPasswordPage
