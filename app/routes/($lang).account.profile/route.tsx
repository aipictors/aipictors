import { AppPageCenter } from "@/_components/app/app-page-center"
import { AccountProfileForm } from "@/routes/($lang).account.profile/_components/account-profile-form"

export default function AccountProfile() {
  return (
    <AppPageCenter className="w-full space-y-8">
      <p className="font-bold text-2xl leading-none">{"プロフィール"}</p>
      <AccountProfileForm />
    </AppPageCenter>
  )
}
