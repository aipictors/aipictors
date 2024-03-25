import { AccountProfileForm } from "@/app/[lang]/account/profile/_components/account-profile-form"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const AccountProfilePage = async () => {
  return (
    <AppPageCenter className="w-full space-y-8">
      <p className="font-bold text-2xl leading-none">{"プロフィール"}</p>
      <AccountProfileForm />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default AccountProfilePage
