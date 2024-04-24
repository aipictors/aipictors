import { PhotoProvider, PhotoView } from "react-photo-view"

type Props = {
  imageURLs: string[]
  thumbnailUrl: string
  initIndex: number
  imageClassName?: string
}

/**
 * 画像プレビュー
 * @param props
 * @returns
 */
export const ImagesPreview = (props: Props) => {
  const onChangePreviewImage = (visible: boolean) => {
    // インデックスをリセット
    if (visible) {
      // body要素のスクロール禁止
      if (document.body.parentElement) {
        document.body.parentElement.style.overflow = "hidden"
      }
      // PhotoView-Slider__ArrowRightクラスを持つ要素を取得してselectedImageIndex回数クリックする
      setTimeout(() => {
        const arrowRight = document.querySelector(
          ".PhotoView-Slider__ArrowRight",
        ) as HTMLElement
        if (arrowRight) {
          for (let i = 0; i < props.initIndex; i++) {
            setTimeout(() => {
              arrowRight.click()
            }, 100)
          }
        }
      }, 500)
    } else {
      // body要素のスクロール許可
      if (document.body.parentElement) {
        document.body.parentElement.style.overflow = "auto"
      }
    }
  }

  return (
    <PhotoProvider maskOpacity={0.7} onVisibleChange={onChangePreviewImage}>
      {props.imageURLs.map((image, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <PhotoView key={index} src={image}>
          {index < 1 ? (
            <img
              className={
                props.imageClassName
                  ? props.imageClassName
                  : "h-full w-auto rounded bg-card object-contain xl:h-screen"
              }
              alt="selected-image"
              src={props.thumbnailUrl}
            />
          ) : undefined}
        </PhotoView>
      ))}
    </PhotoProvider>
  )
}
