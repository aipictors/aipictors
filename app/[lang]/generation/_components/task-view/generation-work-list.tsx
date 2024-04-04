"use client"

import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationWorkCard } from "@/app/[lang]/generation/tasks/_components/generation-work-card "
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WorkNode, WorksQuery } from "@/graphql/__generated__/graphql"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense } from "react"

type Props = {
  onCancel?(): void
  thumbnailSize: number
  works: WorksQuery
  isPreviewByHover: boolean
}

/**
 * 画像生成作品の一覧
 * @param props
 * @returns
 */
export const GenerationWorkList = (props: Props) => {
  return (
    <>
      <ScrollArea>
        {/* <Suspense fallback={<AppLoadingPage />}> */}
        <div
          className={cn("grid gap-2 p-2 pt-0 pr-4 pb-16 md:pb-4 sm:pl-4", {
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
          {props.works?.works.map(
            (work: WorkNode) =>
              work && (
                <ErrorBoundary key={work.id} fallback={ErrorResultCard}>
                  <Suspense fallback={<FallbackTaskCard />}>
                    <GenerationWorkCard
                      work={work}
                      isPreviewByHover={props.isPreviewByHover}
                    />
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
