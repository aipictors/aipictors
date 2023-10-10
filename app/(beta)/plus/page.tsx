import type { Metadata } from "next"
import { MainPlus } from "app/(beta)/plus/components/MainPlus"
import { MainCenterPage } from "app/components/MainCenterPage"

/**
 * サブスク
 * @returns
 */
const PlusPage = async () => {
  return (
    <MainCenterPage>
      <MainPlus />
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

export default PlusPage
