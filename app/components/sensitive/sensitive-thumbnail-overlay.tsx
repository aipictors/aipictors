import MosaicCanvas from "~/components/mosaic-canvas"
import { Badge } from "~/components/ui/badge"

type Props = {
  imageUrl: string
  imageWidth?: number
  imageHeight?: number
  isHidden: boolean
}

export function SensitiveThumbnailOverlay(props: Props) {
  if (!props.isHidden) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded">
      <MosaicCanvas
        imageUrl={props.imageUrl}
        width={props.imageWidth}
        height={props.imageHeight}
        className="h-full w-full"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-2 flex justify-center px-2">
        <Badge className="border-transparent bg-black/70 text-white hover:bg-black/70">
          R18 / R18G
        </Badge>
      </div>
    </div>
  )
}