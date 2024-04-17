import { AutoLogoutForm } from "@/[lang]/(main)/logout/_components/auto-logout-form"
import { AppPageCenter } from "@/_components/app/app-page-center"

/**
 * コントリビュータ一覧ページ
 */
export default function Logout() {
  return (
    <AppPageCenter>
      <AutoLogoutForm />
    </AppPageCenter>
  )
}
