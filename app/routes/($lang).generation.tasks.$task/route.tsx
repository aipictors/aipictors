import { GenerationTaskView } from "@/[lang]/generation/tasks/[task]/_components/generation-task-view"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  return {}
}

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function Task() {
  const params = useParams()

  if (params.task === undefined) {
    return null
  }

  const data = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto w-full max-w-fit">
      <GenerationTaskView taskId={params.task} />
    </div>
  )
}
