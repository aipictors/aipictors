import { AppPageCenter } from "~/components/app/app-page-center"
import { AutoLogoutForm } from "~/routes/($lang)._main.logout/components/auto-logout-form"

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
