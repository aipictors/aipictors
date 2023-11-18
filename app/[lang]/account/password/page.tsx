import { AccountPasswordForm } from "@/app/[lang]/account/password/_components/setting-password-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const AccountPasswordPage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <p className="leading-none font-bold text-2xl">{"パスワード"}</p>
        <AccountPasswordForm />
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountPasswordPage
