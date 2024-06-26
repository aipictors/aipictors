import { ScrollArea } from "@/_components/ui/scroll-area"
import { Skeleton } from "@/_components/ui/skeleton"
import type { worksQuery } from "@/_graphql/queries/work/works"
import { cn } from "@/_lib/cn"
import { ErrorResultCard } from "@/routes/($lang).generation._index/_components/error-result-card"
import { FallbackTaskCard } from "@/routes/($lang).generation._index/_components/fallback-task-card"
import { GenerationWorkCard } from "@/routes/($lang).generation._index/_components/generation-work-card "
import type { ResultOf } from "gql.tada"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

type Props = {
  loading: boolean
  onCancel?(): void
  thumbnailSize: number
  works: ResultOf<typeof worksQuery> | undefined
  isPreviewByHover: boolean
}

/**
 * 画像生成作品の一覧
 */
export const GenerationWorkList = (props: Props) => {
  if (props.works === undefined && !props.loading) {
    return null
  }

  return (
    <>
      <ScrollArea type="always">
        {/* <Suspense fallback={<AppLoadingPage />}> */}
        <div
          className={cn("grid gap-2 p-2 pt-0 pr-4 pb-16 sm:pl-4 md:pb-4", {
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
          {props.loading ? (
            <>
              <Skeleton className="h-40 w-32" />
            </>
          ) : null}

          {/* biome-ignore lint/complexity/useOptionalChain: <explanation> */}
          {props.works !== undefined &&
            props.works?.works !== undefined &&
            props.works?.works.map(
              (work) =>
                work && (
                  <ErrorBoundary key={work.id} fallback={<ErrorResultCard />}>
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
