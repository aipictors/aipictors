import type { Metadata } from "next"
import dynamic from "next/dynamic"

const DynamicImageGenerationResultView = dynamic(
  () => {
    return import(
      "@/app/[lang]/(beta)/generation/results/[result]/_components/dynamic-generation-result-view"
    )
  },
  { ssr: false },
)

type Props = {
  params: { result: string }
}

const ResultPage = async (props: Props) => {
  return (
    <div className="px-4 py-4 w-full max-w-fit mx-auto">
      <DynamicImageGenerationResultView taskId={props.params.result} />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default ResultPage
