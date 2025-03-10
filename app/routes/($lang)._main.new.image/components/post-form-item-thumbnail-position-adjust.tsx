import { useTranslation } from "~/hooks/use-translation"
import { ThumbnailPositionAdjustDialog } from "~/routes/($lang)._main.new.image/components/thumbnail-position-adjust-dialog"

type Props = {
  thumbnailBase64: string
  isThumbnailLandscape: boolean
  thumbnailPosX: number
  thumbnailPosY: number
  setThumbnailPosX(value: number): void
  setThumbnailPosY(value: number): void
}

/**
 * サムネイル位置調整フォーム
 */
export function PostFormItemThumbnailPositionAdjust(props: Props) {
  const t = useTranslation()

  return (
    <>
      <ThumbnailPositionAdjustDialog
        isThumbnailLandscape={props.isThumbnailLandscape}
        thumbnailBase64={props.thumbnailBase64}
        thumbnailPosX={props.thumbnailPosX}
        thumbnailPosY={props.thumbnailPosY}
        setThumbnailPosX={props.setThumbnailPosX}
        setThumbnailPosY={props.setThumbnailPosY}
      >
        <div className="cursor m-auto block transform cursor-pointer bg-zinc-800 transition-all duration-300 hover:bg-zinc-700">
          <div className="m-auto flex w-64 items-center justify-center space-x-2 rounded-md p-4">
            <div className="size-16 overflow-hidden rounded-md">
              <img
                alt="adjust-thumbnail"
                src={props.thumbnailBase64}
                style={{
                  transform: `translateX(${props.thumbnailPosX}%) translateY(${props.thumbnailPosY}%)`,
                  maxWidth: "initial",
                }}
                className={props.isThumbnailLandscape ? "h-16" : "w-16"}
              />
            </div>
            <p className="text-white">
              {t("サムネイルを調整", "Adjust thumbnail")}
            </p>
          </div>
        </div>
      </ThumbnailPositionAdjustDialog>
    </>
  )
}
