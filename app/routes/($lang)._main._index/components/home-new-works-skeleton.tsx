import { Skeleton } from "~/components/ui/skeleton"

type Props = {
  view: "new" | "popular" | "new-user"
  isPagination?: boolean
}

const cardHeights = [220, 280, 240, 320, 260, 300, 230, 290, 250, 340, 210, 305]

export function HomeNewWorksSkeleton(props: Props) {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cardHeights.map((height, index) => (
          <div
            key={`new-works-skeleton-${props.view}-${height}-${index}`}
            className="overflow-hidden rounded-xl bg-card"
          >
            <div className="relative overflow-hidden">
              <Skeleton
                className="w-full rounded-none"
                style={{ height: `${height}px` }}
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                {index % 3 === 0 && (
                  <div className="rounded-md bg-background/85 px-1.5 py-1">
                    <Skeleton className="h-3 w-8 bg-muted" />
                  </div>
                )}
                <div className="rounded-md bg-background/85 px-1.5 py-1">
                  <Skeleton className="h-3 w-6 bg-muted" />
                </div>
              </div>
              <div className="absolute right-3 bottom-3 rounded-full bg-background/90 p-2">
                <Skeleton className="h-5 w-5 rounded-full bg-muted" />
              </div>
            </div>

            <div className="space-y-2 px-1 pt-2 pb-1">
              <Skeleton className="h-5 w-4/5" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-4 w-6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {props.isPagination && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center border border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-10 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}
