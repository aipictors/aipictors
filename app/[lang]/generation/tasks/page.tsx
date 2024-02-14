import { GenerationTasksList } from "@/app/[lang]/generation/tasks/_components/generation-tasks-list"
import type { Metadata } from "next"

/**
 * 画像生成の履歴
 * @returns
 */
const GenerationResultsPage = async () => {
  return <GenerationTasksList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default GenerationResultsPage
