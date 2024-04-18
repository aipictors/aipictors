import { AppPageCenter } from "@/_components/app/app-page-center"
import { AutoLogoutForm } from "@/routes/($lang)._main.logout/_components/auto-logout-form"

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
