import type { Metadata } from "next"
import { MainPlus } from "app/plus/components/MainPlus"

/**
 * サブスク
 * @returns
 */
const PlusPage = async () => {
  return <MainPlus />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "Aipictors+（ピクタス）" },
  }
}

export const revalidate = 240

export default PlusPage
