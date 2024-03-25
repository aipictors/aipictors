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
  title: "コントリビュータ一覧",
}

export const revalidate = 60

export default ContributorsPage
