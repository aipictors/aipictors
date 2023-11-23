import { AccountPasswordForm } from "@/app/[lang]/account/password/_components/setting-password-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const AccountPasswordPage = async () => {
  return (
    <MainCenterPage className="w-full space-y-8 px-4 md:pr-8">
      <p className="leading-none font-bold text-2xl">{"パスワード"}</p>
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
