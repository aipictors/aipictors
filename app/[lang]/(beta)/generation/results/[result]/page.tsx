import { GenerationTaskView } from "@/app/[lang]/(beta)/generation/results/[result]/_components/generation-task-view"
import type { Metadata } from "next"

type Props = {
  params: { result: string }
}

const ResultPage = async (props: Props) => {
  return (
    <div className="px-4 py-4 w-full max-w-fit mx-auto">
      <GenerationTaskView taskId={props.params.result} />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default ResultPage
