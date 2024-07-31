import { AccountPasswordForm } from "~/routes/($lang).account.password/components/setting-password-form"

export default function AccountPassword() {
  return (
    <div className="w-full space-y-8">
      <p className="font-bold text-2xl leading-none">{"パスワード"}</p>
      <AccountPasswordForm />
    </div>
  )
}
