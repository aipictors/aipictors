import { GenerationWorkDialogButton } from "@/routes/($lang).generation._index/components/generation-work-dialog-button"
import { ZoomIn } from "lucide-react"

type Props = {
  imageUrl: string
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 画像生成作品の画像ズームアップボタン
 */
export const GenerationWorkZoomUpButton = (props: Props) => {
  return (
    <GenerationWorkDialogButton isAbsolute={true} imageUrl={props.imageUrl}>
      <div className="flex rounded-lg bg-white px-1 py-1 opacity-80">
        <div
          onMouseEnter={() => {
            props.setIsHovered(true)
          }}
        >
          <ZoomIn color="black" />
        </div>
      </div>
    </GenerationWorkDialogButton>
  )
}
