import type { Metadata } from "next"
import { PlusCancel } from "app/(beta)/plus/cancel/components/PlusCancel"
import { MainCenterPage } from "app/components/MainCenterPage"

/**
 * サブスクの決済をキャンセルした場合のページ
 * @returns
 */
const PlusCancelPage = async () => {
  return (
    <MainCenterPage>
      <PlusCancel />
    </MainCenterPage>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+のキャンセル" },
  }
}

export const revalidate = 240

export default PlusCancelPage
