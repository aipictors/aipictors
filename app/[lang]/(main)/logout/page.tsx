import { AutoLogoutForm } from "@/[lang]/(main)/logout/_components/auto-logout-form"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

const LogoutPage = async () => {
  return (
    <AppPageCenter>
      <AutoLogoutForm />
    </AppPageCenter>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default LogoutPage
