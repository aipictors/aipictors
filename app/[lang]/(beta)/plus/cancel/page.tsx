import { PlusCancel } from "app/[lang]/(beta)/plus/cancel/_components/plus-cancel"
import { MainCenterPage } from "app/_components/page/main-center-page"
import type { Metadata } from "next"

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
