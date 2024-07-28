import { Skeleton } from "~/components/ui/skeleton"

/**
 * タスク一覧のプレースホルダー
 */
export const GenerationTaskListViewPlaceholder = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-24 w-16 rounded-xl" />
    </div>
  )
}
