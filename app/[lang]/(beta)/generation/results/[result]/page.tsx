import { createClient } from "@/app/_contexts/client"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import type { Metadata } from "next"

type Props = {
  params: { result: string }
}

const ResultPage = async (props: Props) => {
  const client = createClient()

  const generationResult = await client.query({
    query: imageGenerationTaskQuery,
    variables: { id: props.params.result },
  })

  return (
    <div className="px-4 py-4 w-full max-w-fit mx-auto">
      <div className="flex flex-col lg:flex-row">
        {generationResult.data.imageGenerationTask.id}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ResultPage
