import { Skeleton } from "~/components/ui/skeleton"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkDummyProps = RenderPhotoProps & {
  width: number
  height: number
}

/**
 * ホームの作品ダミー
 */
export function HomeWorkDummy({ width, height }: HomeWorkDummyProps) {
  return <Skeleton className={`m-2 w-[${width}px] h-[${height}px]`} />
}
