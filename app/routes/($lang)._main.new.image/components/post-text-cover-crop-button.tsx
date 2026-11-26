import { CropIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ImageCropperModal } from "~/components/modal-image-cropper"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** いまのカバー画像（data URL か、編集中の作品の画像 URL） */
  imageSrc: string
  /** 切り抜いた画像（data URL）を受け取る */
  onCrop: (croppedImage: string) => void
}

/**
 * 画像の幅と高さを読む
 */
const loadImageSize = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = reject
    image.src = src
  })

/**
 * 小説・コラムのカバー画像を、見せたいところにズームして切り抜くボタン。
 * アイコンやスタンプと同じ切り抜きの画面で、比率（元の比率・縦長・正方形・横長）を選べる。
 * 切り抜いた範囲の大きさのまま差し替えるので、拡大して画質を上げることはしない
 */
export function PostTextCoverCropButton(props: Props) {
  const t = useTranslation()
  const [imageSize, setImageSize] = useState<{
    width: number
    height: number
  } | null>(null)

  const open = async () => {
    try {
      setImageSize(await loadImageSize(props.imageSrc))
    } catch (error) {
      console.error(error)
      toast(
        t(
          "画像を読み込めませんでした。もう一度お試しください",
          "Failed to load the image. Please try again",
        ),
      )
    }
  }

  const aspectOptions = imageSize
    ? [
        {
          label: t("元の比率", "Original"),
          aspect: imageSize.width / imageSize.height,
        },
        { label: t("縦長 3:4", "Portrait 3:4"), aspect: 3 / 4 },
        { label: t("正方形", "Square"), aspect: 1 },
        { label: t("横長 16:9", "Landscape 16:9"), aspect: 16 / 9 },
      ]
    : []

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9"
        onClick={() => {
          void open()
        }}
      >
        <CropIcon className="mr-1.5 size-4" />
        {t("カバーをズームして切り抜く", "Zoom & crop cover")}
      </Button>
      {imageSize && (
        <ImageCropperModal
          src={props.imageSrc}
          isOpen={true}
          cropWidth={imageSize.width}
          cropHeight={imageSize.height}
          title={t(
            "カバー画像をズームして切り抜く",
            "Zoom and crop the cover image",
          )}
          aspectOptions={aspectOptions}
          isKeepCroppedSize
          fileExtension="webp"
          onCrop={(croppedImage) => {
            props.onCrop(croppedImage)
            toast(t("カバー画像を切り抜きました", "Cover image cropped"))
          }}
          onClose={() => setImageSize(null)}
        />
      )}
    </>
  )
}
