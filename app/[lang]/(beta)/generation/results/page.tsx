import type { Metadata } from "next"
import dynamic from "next/dynamic"

const DynamicGenerationTasksView = dynamic(
  () => {
    return import(
      "@/app/[lang]/(beta)/generation/results/_components/dynamic-generation-tasks-view"
    )
  },
  { ssr: false },
)

/**
 * 画像生成の履歴
 * @returns
 */
const GenerationResultsPage = async () => {
  return <DynamicGenerationTasksView />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default GenerationResultsPage
