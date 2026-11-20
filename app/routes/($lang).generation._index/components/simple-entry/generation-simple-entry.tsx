import { Skeleton } from "~/components/ui/skeleton"

/**
 * はじめての人の入口（/generation/home）と生成画面のどちらを出すか決めるまでの表示（生成画面が一瞬出てしまわないように）
 */
export function GenerationEntrySkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1600px] pt-3 pb-16 md:pt-6"
      aria-busy="true"
    >
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mx-auto h-7 w-64" />
        <Skeleton className="mt-4 h-36 w-full rounded-2xl" />
      </div>
      <Skeleton className="mt-8 h-8 w-96 max-w-full rounded-full" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: 並びが変わらない仮の表示
            key={index}
            className="aspect-3/4 w-full rounded-xl"
          />
        ))}
      </div>
    </div>
  )
}
