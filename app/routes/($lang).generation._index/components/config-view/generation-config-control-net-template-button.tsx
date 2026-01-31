import { Button } from "~/components/ui/button"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"

type Props = {
  module: string
  model: string
  weight: number
  imageUrl: string
  thumbnailImageUrl: string
  onClick: (
    module: string,
    model: string,
    weight: number,
    imageBase64: string,
  ) => void
}

/**
 * ControlNet設定
 */
export function GenerationConfigControlNetTemplateButton (props: Props) {
  return (
    <div className="flex flex-col gap-y-2">
      <Button
        aria-label="-"
        onClick={async () => {
          // imageUrlをbase64に変換
          const base64 = await getBase64FromImageUrl(props.imageUrl)
          props.onClick(props.module, props.model, props.weight, base64)
        }}
        className="h-auto"
        variant={"secondary"}
      >
        <img
          className="max-h-16 max-w-24"
          src={props.thumbnailImageUrl}
          alt={"-"}
        />
      </Button>
    </div>
  )
}
