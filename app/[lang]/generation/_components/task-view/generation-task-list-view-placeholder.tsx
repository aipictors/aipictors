"use client"

import { Skeleton } from "@/_components/ui/skeleton"

/**
 * タスク一覧のプレースホルダー
 * @param props
 * @returns
 */
export const GenerationTaskListViewPlaceholder = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-24 w-16 rounded-xl" />
    </div>
  )
}
