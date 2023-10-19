import { PlusForm } from "app/[lang]/(beta)/plus/_components/PlusForm"
import { SettingsNavigation } from "app/[lang]/settings/_components/SettingsNavigation"
import { MainCenterPage } from "app/_components/MainCenterPage"
import type { Metadata } from "next"

/**
 * 設定
 * @returns
 */
const SettingsPage: React.FC = async () => {
  return (
    <MainCenterPage>
      <SettingsNavigation />
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

export default SettingsPage
