import { GenerationTaskHistory } from "@/app/[lang]/generation/tasks/_components/generation-task-history"
import type { Metadata } from "next"

/**
 * 画像生成の履歴
 * @returns
 */
const GenerationResultsPage = async () => {
  return <GenerationTaskHistory />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default GenerationResultsPage
