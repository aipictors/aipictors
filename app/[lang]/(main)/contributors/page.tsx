import { ContributorsView } from "@/app/[lang]/(main)/contributors/_components/contributors-view"
import type { Metadata } from "next"

/**
 * コントリビュータ一覧ページ
 */
const ContributorsPage = async () => {
  return <ContributorsView />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "Aipictors Contributors" },
  description: "Aipictorsのコントリビュータ一覧です",
  openGraph: {
    title: { absolute: "Aipictors Contributors" },
    description: "Aipictorsのコントリビュータ一覧です",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2024/03/60f40ea7-ab71-496e-9e88-cb16f655a230-1.webp",
    },
  },
  twitter: {
    title: { absolute: "Aipictors Contributors" },
    description: "Aipictorsのコントリビュータ一覧です",
  },
}

export default ContributorsPage
