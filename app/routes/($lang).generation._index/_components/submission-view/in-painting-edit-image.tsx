import { InpaintCanvas } from "@/routes/($lang).generation._index/_components/submission-view/inpaint-canvas"

type Props = {
  imageUrl: string
  onChange(value: string): void
  onLoaded(): void
  isLoading: boolean
}

/**
 * Konvaを使った画像編集コンポーネント
 * @param props
 * @returns
 */
export function InPaintingEditImage(props: Props) {
  return (
    <>
      <InpaintCanvas
        status={"reverse-draw"}
        onChange={props.onChange}
        onLoaded={props.onLoaded}
        isLoading={props.isLoading}
        imageUrl={props.imageUrl}
      />
    </>
  )
}
