import { AccountProfileForm } from "@/app/[lang]/account/profile/_components/account-profile-form"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const AccountProfilePage = async () => {
  return (
    <MainCenterPage>
      <div className="w-full space-y-8">
        <p className="leading-none font-bold text-2xl">{"プロフィール"}</p>
        <AccountProfileForm />
      </div>
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default AccountProfilePage
