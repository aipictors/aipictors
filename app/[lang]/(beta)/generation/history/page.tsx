import { GenerationHistoryList } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-list"

import type { Metadata } from "next"

/**
 * 画像生成の履歴
 * @returns
 */
const GenerationHistoriesPage = async () => {
  return <GenerationHistoryList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default GenerationHistoriesPage
