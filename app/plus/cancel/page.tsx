import type { Metadata } from "next"
import { MainPlusCancel } from "app/plus/cancel/components/MainPlusCancel"

/**
 * サブスクの決済をキャンセルした場合のページ
 * @returns
 */
const PlusCancelPage = async () => {
  return <MainPlusCancel />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "サブスク" },
  }
}

export const revalidate = 240

export default PlusCancelPage
