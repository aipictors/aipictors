import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ParamsError } from "@/_errors/params-error"
import { GenerationTaskView } from "@/routes/($lang).generation.tasks.$task/_components/generation-task-view"
import { useParams } from "@remix-run/react"

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function Task() {
  const params = useParams()

  if (params.task === undefined) {
    return new ParamsError()
  }

  return (
    <div className="mx-auto w-full max-w-fit">
      <GenerationTaskView taskId={params.task} />
    </div>
  )
}
