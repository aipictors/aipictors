import { AccountNavigation } from "@/[lang]/account/_components/account-navigation"
import { AppPageCenter } from "@/_components/app/app-page-center"
import type { Metadata } from "next"

/**
 * アカウント
 * @returns
 */
export default function Account() {
  return (
    <AppPageCenter>
      <AccountNavigation />
    </AppPageCenter>
  )
}
