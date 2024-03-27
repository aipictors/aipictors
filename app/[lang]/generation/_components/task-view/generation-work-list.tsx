"use client"

import { GenerationTaskListViewPlaceholder } from "@/app/[lang]/generation/_components/task-view/generation-task-list-view-placeholder"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { useGenerationQuery } from "@/app/[lang]/generation/_hooks/use-generation-query"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { GenerationWorkCard } from "@/app/[lang]/generation/tasks/_components/generation-work-card "
import { ResponsivePagination } from "@/app/_components/responsive-pagination"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import type { WorkNode, WorksQuery } from "@/graphql/__generated__/graphql"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
import { cn } from "@/lib/utils"
import type { ApolloQueryResult } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense, startTransition, useEffect } from "react"
import { toast } from "sonner"

type Props = {
  onCancel?(): void
  thumbnailSize: number
  works: ApolloQueryResult<WorksQuery>
}

/**
 * 画像生成作品の一覧
 * @param props
 * @returns
 */
export const GenerationWorkList = async (props: Props) => {
  const context = useGenerationContext()

  const client = createClient()

  const queryData = useGenerationQuery()

  const isTimeout = useFocusTimeout()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  return (
    <>
      <ScrollArea>
        {/* <Suspense fallback={<AppLoadingPage />}> */}
        <div
          className={cn("grid gap-2 p-2 pt-0 pr-4 sm:pl-4", {
            "grid-cols-0": props.thumbnailSize === 10,
            "grid-cols-1": props.thumbnailSize === 9,
            "grid-cols-2": props.thumbnailSize === 8,
            "grid-cols-3": props.thumbnailSize === 7,
            "grid-cols-4": props.thumbnailSize === 6,
            "grid-cols-5": props.thumbnailSize === 5,
            "grid-cols-6": props.thumbnailSize === 4,
            "grid-cols-7": props.thumbnailSize === 3,
            "grid-cols-8": props.thumbnailSize === 2,
            "grid-cols-9": props.thumbnailSize === 1,
            "grid-cols-10": props.thumbnailSize === 10,
          })}
        >
          {props.works?.data.works.map(
            (work: WorkNode) =>
              work && (
                <ErrorBoundary key={work.id} fallback={ErrorResultCard}>
                  <Suspense fallback={<FallbackTaskCard />}>
                    <GenerationWorkCard work={work} isPreviewByHover={false} />
                  </Suspense>
                </ErrorBoundary>
              ),
          )}
        </div>
        {/* </Suspense> */}
      </ScrollArea>
    </>
  )
}
