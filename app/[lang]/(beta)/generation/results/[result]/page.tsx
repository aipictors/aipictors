import { ImageGenerationTaskResult } from "@/app/[lang]/(beta)/generation/results/[result]/_components/image-generation-task-result"
import type { Metadata } from "next"

type Props = {
  params: { result: string }
}

const ResultPage = async (props: Props) => {
  return (
    <div className="px-4 py-4 w-full max-w-fit mx-auto">
      <ImageGenerationTaskResult taskId={props.params.result} />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default ResultPage
