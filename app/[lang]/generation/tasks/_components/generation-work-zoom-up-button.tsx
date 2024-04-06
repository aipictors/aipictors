import { GenerationWorkDialogButton } from "@/[lang]/generation/tasks/[task]/_components/generation-work-dialog-button"
import { ZoomIn } from "lucide-react"

type Props = {
  imageUrl: string
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 画像生成作品の画像ズームアップボタン
 * @returns
 */
export const GenerationWorkZoomUpButton = (props: Props) => {
  return (
    <GenerationWorkDialogButton
      isAbsolute={true}
      imageUrl={props.imageUrl}
      children={
        <div className="flex rounded-lg bg-white px-1 py-1 opacity-80">
          <div
            onMouseEnter={() => {
              props.setIsHovered(true)
            }}
          >
            <ZoomIn color="black" />
          </div>
        </div>
      }
    />
  )
}
