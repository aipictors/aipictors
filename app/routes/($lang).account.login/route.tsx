import { AccountLoginForm } from "@/[lang]/account/login/_components/account-login-form"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function AccountLogin() {
  return (
    <AppPageCenter>
      <p className="font-bold text-2xl leading-none">ユーザID</p>
      <AccountLoginForm />
    </AppPageCenter>
  )
}
