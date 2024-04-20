import { AppPageCenter } from "@/_components/app/app-page-center"
import { AccountPasswordForm } from "@/routes/($lang).account.password/_components/setting-password-form"

export default function AccountPassword() {
  return (
    <AppPageCenter className="w-full space-y-8">
      <p className="font-bold text-2xl leading-none">{"パスワード"}</p>
      <AccountPasswordForm />
    </AppPageCenter>
  )
}
