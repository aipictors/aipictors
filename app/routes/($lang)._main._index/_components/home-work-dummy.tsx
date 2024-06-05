import { Skeleton } from "@/_components/ui/skeleton"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkDummyProps = RenderPhotoProps & {
  width: number
  height: number
}

/**
 * ホームの作品ダミー
 */
export function HomeWorkDummy({ width, height }: HomeWorkDummyProps) {
  return (
    <Skeleton
      className={`m-2 w-[${
        width
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
      }px] h-[${height}px]`}
    />
  )
}
