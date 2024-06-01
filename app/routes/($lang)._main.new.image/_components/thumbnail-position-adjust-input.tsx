import { ThumbnailPositionAdjustDialog } from "@/routes/($lang)._main.new.image/_components/thumbnail-position-adjust-dialog"
import type React from "react"

type Props = {
  thumbnailBase64: string
  isThumbnailLandscape: boolean
  thumbnailPosX: number
  thumbnailPosY: number
  setThumbnailPosX: React.Dispatch<React.SetStateAction<number>>
  setThumbnailPosY: React.Dispatch<React.SetStateAction<number>>
}

/**
 * サムネイル位置調整フォーム
 */
export const ThumbnailPositionAdjustInput = (props: Props) => {
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
        <div className="cursor m-auto block transform cursor-pointer bg-gray-800">
          <div className="m-auto flex w-64 items-center justify-center space-x-2 rounded-md p-4">
            <div className="h-16 w-16 overflow-hidden rounded-md">
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
            <p className="text-white">サムネイルを調整</p>
          </div>
        </div>
      </ThumbnailPositionAdjustDialog>
    </>
  )
}
