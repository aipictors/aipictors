import { AccountNavigation } from "app/[lang]/account/_components/AccountNavigation"
import { MainCenterPage } from "app/_components/page/MainCenterPage"
import type { Metadata } from "next"

/**
 * アカウント
 * @returns
 */
const AccountPage: React.FC = async () => {
  return (
    <MainCenterPage>
      <AccountNavigation />
    </MainCenterPage>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+" },
  }
}

export const revalidate = 240

export default AccountPage
