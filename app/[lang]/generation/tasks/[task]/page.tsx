import { GenerationTaskView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-view"
import type { Metadata } from "next"

type Props = {
  params: { task: string }
}

const TaskPage = async (props: Props) => {
  return (
    <div className="p-4 w-full max-w-fit mx-auto">
      <GenerationTaskView taskId={props.params.task} />
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 0

export default TaskPage
