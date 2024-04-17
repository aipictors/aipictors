import { AccountProfileForm } from "@/[lang]/account/profile/_components/account-profile-form"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function AccountProfile() {
  return (
    <AppPageCenter className="w-full space-y-8">
      <p className="font-bold text-2xl leading-none">{"プロフィール"}</p>
      <AccountProfileForm />
    </AppPageCenter>
  )
}
