import { AccountNavigation } from "@/[lang]/account/_components/account-navigation"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

/**
 * アカウント
 * @returns
 */
const AccountPage = async () => {
  return (
    <AppPageCenter>
      <AccountNavigation />
    </AppPageCenter>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+" },
  }
}

export default AccountPage
