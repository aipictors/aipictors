import { Skeleton } from "~/components/ui/skeleton"

type Props = {
  view: "new" | "popular" | "new-user"
  isPagination?: boolean
}

const cardHeights = [220, 280, 240, 320, 260, 300, 230, 290, 250, 340, 210, 305]

function SkeletonToggleGroup(props: {
  items: Array<{ width: string; active?: boolean }>
}) {
  return (
    <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
      {props.items.map((item, index) => (
        <div
          key={`toggle-item-${item.width}-${index}`}
          className={`rounded-md px-2 py-1 ${item.active ? "bg-background shadow-sm" : ""}`}
        >
          <Skeleton className={`h-7 ${item.width}`} />
        </div>
      ))}
    </div>
  )
}

export function HomeNewWorksSkeleton(props: Props) {
  const showFilterPanel = props.view === "new"
  const showFeedToggle = props.view !== "popular"

  return (
    <div className="space-y-4" aria-hidden="true">
      {showFilterPanel ? (
        <div className="rounded-lg border bg-muted/30 p-2 shadow-sm">
          <div className="flex items-center justify-end">
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 shadow-sm">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <SkeletonToggleGroup
                  items={[{ width: "w-16" }, { width: "w-16", active: true }]}
                />
                <SkeletonToggleGroup
                  items={[{ width: "w-20", active: true }, { width: "w-20" }]}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          {showFeedToggle && (
            <SkeletonToggleGroup
              items={[
                { width: "w-16", active: !props.isPagination },
                { width: "w-16", active: Boolean(props.isPagination) },
              ]}
            />
          )}
          <SkeletonToggleGroup
            items={[{ width: "w-20", active: true }, { width: "w-20" }]}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cardHeights.map((height, index) => (
          <div
            key={`new-works-skeleton-${props.view}-${height}-${index}`}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <div className="relative overflow-hidden">
              <Skeleton
                className="w-full rounded-none"
                style={{ height: `${height}px` }}
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                {index % 3 === 0 && (
                  <Skeleton className="h-6 w-12 rounded-full" />
                )}
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/30 via-black/5 to-transparent px-3 pt-8 pb-3">
                <Skeleton className="h-3 w-20 bg-white/30" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-3 w-8 bg-white/30" />
                  <Skeleton className="h-3 w-8 bg-white/30" />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <Skeleton className="ml-auto h-3 w-10" />
                  <Skeleton className="ml-auto h-2.5 w-8" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {props.isPagination && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center border border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 shadow-sm">
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
