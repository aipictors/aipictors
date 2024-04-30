import { GenerationImageDialogButton } from "@/routes/($lang).generation.tasks.$task/_components/generation-image-dialog-button"
import { ZoomIn } from "lucide-react"

type Props = {
  taskId: string
  token: string
  size: number
  imageFileName: string
  thumbnailImageFileName: string
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 画像生成の履歴の画像ズームアップボタン
 * @returns
 */
export const GenerationTaskZoomUpButton = (props: Props) => {
  return (
    <GenerationImageDialogButton
      isAbsolute={true}
      taskId={props.taskId}
      userToken={props.token}
      fileName={props.imageFileName}
      thumbnailFileName={props.thumbnailImageFileName}
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
