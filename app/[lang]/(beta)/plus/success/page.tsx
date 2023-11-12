import { MainPlusDocument } from "app/[lang]/(beta)/plus/success/_components/plus-success-document"
import type { Metadata } from "next"

/**
 * サブスクの決済を完了した場合のページ
 * @returns
 */
const PlusSuccessPage = async () => {
  return <MainPlusDocument />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+の手続き完了" },
  }
}

export const revalidate = 240

export default PlusSuccessPage
