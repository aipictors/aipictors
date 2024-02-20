import { GenerationImageDialogButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-image-dialog-button"
import { Scan } from "lucide-react"

type Props = {
  taskId: string
  token: string
  size: number
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 画像生成の履歴の画像ズームアップボタン
 * @returns
 */
export const GenerationTaskZoomUpButton = (props: Props) => {
  /**
   * アイコンサイズのクラスを返す
   * @returns アイコンサイズのクラス
   */
  const sizeClassName = () => {
    if (props.size === 1) {
      return "h-6 w-6"
    }
    if (props.size === 2) {
      return "h-8 w-8"
    }
    return "h-12 w-12"
  }

  return (
    <GenerationImageDialogButton
      isAbsolute={true}
      taskId={props.taskId}
      taskToken={props.token}
      children={
        <div
          onMouseEnter={() => {
            props.setIsHovered(true)
          }}
        >
          <Scan className={sizeClassName()} color="black" />
        </div>
      }
    />
  )
}
