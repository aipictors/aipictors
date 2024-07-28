import { Button } from "~/components/ui/button"
import {} from "~/utils/get-extract-info-from-png"
import {} from "@dnd-kit/core"
import { XIcon } from "lucide-react"
import {} from "react"

type Props = {
  onDelete: () => void
  videoFile: File
}

/**
 * 動画アイテム
 */
export const VideoItem = (props: Props) => {
  return (
    <div className="relative m-auto w-64">
      <video
        controls
        className="m-auto mt-4 mb-4 w-64"
        src={URL.createObjectURL(props.videoFile)}
      >
        <track kind="captions" src="path_to_captions.vtt" label="English" />
      </video>
      <Button
        className="absolute top-2 right-2 h-6 w-6 md:h-8 md:w-8"
        size={"icon"}
        onClick={() => {
          props.onDelete()
        }}
      >
        <XIcon className="h-4 w-4 md:h-6 md:w-6" />
      </Button>
    </div>
  )
}
