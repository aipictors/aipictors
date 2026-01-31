import { Button } from "~/components/ui/button"
import { XIcon } from "lucide-react"

type Props = {
  onDelete: () => void
  videoFile: File
}

/**
 * 動画アイテム
 */
export function VideoItem (props: Props) {
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
        className="absolute top-1 right-1 size-6 md:h-8 md:w-8"
        size={"icon"}
        onClick={() => {
          props.onDelete()
        }}
      >
        <XIcon className="size-4 md:h-6 md:w-6" />
      </Button>
    </div>
  )
}
