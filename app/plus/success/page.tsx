import type { Metadata } from "next"
import { MainPlusSuccess } from "app/plus/success/components/MainPlusSuccess"

/**
 * サブスクの決済を完了した場合のページ
 * @returns
 */
const PlusSuccessPage = async () => {
  return <MainPlusSuccess />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "サブスク" },
  }
}

export const revalidate = 240

export default PlusSuccessPage
