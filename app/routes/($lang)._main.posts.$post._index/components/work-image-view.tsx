import { WorkImageThumbnailCarousel } from "~/routes/($lang)._main.posts.$post._index/components/work-image-thumbnail-carousel"
import { useEffect, useState } from "react"
import { ImagesPreview } from "~/components/images-preview"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
  onSelectedImage?: (imageURL: string) => void
  mode?: "dialog" | "page"
}

export function WorkImageView(props: Props) {
  const allImageURLs = props.workImageURL
    ? [props.workImageURL, ...props.subWorkImageURLs]
    : props.subWorkImageURLs

  const shouldRenderCarousel = allImageURLs.length > 1

  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // 画像選択関数
  const handleSelectImage = (imageURL: string) => {
    setCurrentIndex(allImageURLs.indexOf(imageURL))
    if (props.onSelectedImage) {
      props.onSelectedImage(imageURL)
    }
  }

  // 左右キーでの画像切り替え（ダイアログモード以外）
  useEffect(() => {
    // ダイアログモードの場合は左右キー操作を無効にする
    if (props.mode === "dialog" || !shouldRenderCarousel) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        const newIndex =
          currentIndex > 0 ? currentIndex - 1 : allImageURLs.length - 1
        setCurrentIndex(newIndex)
        if (props.onSelectedImage) {
          props.onSelectedImage(allImageURLs[newIndex])
        }
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        const newIndex =
          currentIndex < allImageURLs.length - 1 ? currentIndex + 1 : 0
        setCurrentIndex(newIndex)
        if (props.onSelectedImage) {
          props.onSelectedImage(allImageURLs[newIndex])
        }
      }
    }

    // イベントリスナーを追加
    window.addEventListener("keydown", handleKeyDown)

    // クリーンアップでイベントリスナーを削除
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    currentIndex,
    allImageURLs,
    shouldRenderCarousel,
    props.mode,
    props.onSelectedImage,
  ])

  useEffect(() => {
    setCurrentIndex(0)
  }, [props.workImageURL])

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <div className="flex flex-col">
        <ImagesPreview
          thumbnailUrl={allImageURLs[currentIndex]}
          imageURLs={allImageURLs}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          mode={props.mode}
        />
        <WorkImageThumbnailCarousel
          allImageURLs={allImageURLs}
          selectedImage={allImageURLs[currentIndex]}
          currentIndex={currentIndex}
          onSelectImage={handleSelectImage}
        />
      </div>
    )
  }

  if (props.workImageURL) {
    return (
      <div className="relative m-0">
        <ImagesPreview
          currentIndex={0}
          setCurrentIndex={() => {}}
          thumbnailUrl={props.workImageURL}
          imageURLs={[props.workImageURL]}
          mode={props.mode}
        />
      </div>
    )
  }

  return null
}
