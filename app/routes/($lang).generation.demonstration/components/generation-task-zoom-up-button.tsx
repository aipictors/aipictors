import { GenerationImageDialogButton } from "~/routes/($lang).generation.demonstration/components/generation-image-dialog-button"
import { ZoomIn } from "lucide-react"

type Props = {
  taskId: string
  token: string
  size: number
  imageUrl: string
  thumbnailUrl: string
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 画像生成の履歴の画像ズームアップボタン
 */
export function GenerationTaskZoomUpButton(props: Props) {
  return (
    <GenerationImageDialogButton
      isAbsolute={true}
      taskId={props.taskId}
      userToken={props.token}
      imageUrl={props.imageUrl}
      thumbnailUrl={props.thumbnailUrl}
    >
      <div className="flex rounded-lg bg-white px-1 py-1 opacity-80">
        <div
          onMouseEnter={() => {
            props.setIsHovered(true)
          }}
        >
          <ZoomIn color="black" />
        </div>
      </div>
    </GenerationImageDialogButton>
  )
}
