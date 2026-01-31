import { Skeleton } from "~/components/ui/skeleton"
import type { RenderPhotoProps } from "react-photo-album"
import { cn } from "~/lib/utils"

type HomeWorkDummyProps = RenderPhotoProps & {
  width: number
  height: number
}

/**
 * ホームの作品ダミー
 */
export function HomeWorkDummy ({ width, height }: HomeWorkDummyProps) {
  return <Skeleton className={cn("m-2", `w-[${width}px]`, `h-[${height}px]`)} />
}
