import { OgpDialog } from "@/routes/($lang)._main.new.image/_components/ogp-dialog"
import { useEffect, useState } from "react"

type Props = {
  imageBase64: string
  setOgpBase64: (imageBase64: string) => void
  ogpBase64: string
}

/**
 * OGPフォーム
 */
export const OgpInput = (props: Props) => {
  const defaultImageUrl =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/none-select-og.jpg"

  const [displayImage, setDisplayImage] = useState<string>("")

  useEffect(() => {
    if (props.ogpBase64) {
      setDisplayImage(props.ogpBase64)
    } else {
      if (displayImage === "") {
        setDisplayImage(defaultImageUrl)
      }
    }
  }, [props.ogpBase64])

  return (
    <>
      <OgpDialog
        imageBase64={props.imageBase64}
        setResultImage={props.setOgpBase64}
      >
        <div className="cursor m-auto block transform cursor-pointer bg-gray-800">
          <div className="m-auto flex items-center justify-center space-x-2 rounded-md">
            <div className="m-4">
              <img
                alt="adjust-thumbnail"
                src={displayImage}
                className={"max-w-24 rounded-md"}
              />
            </div>
            <p className="text-white">SNSシェア時のサムネイル調整</p>
          </div>
        </div>
      </OgpDialog>
    </>
  )
}
