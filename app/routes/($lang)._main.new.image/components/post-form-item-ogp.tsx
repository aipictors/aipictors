import { OgpDialog } from "~/routes/($lang)._main.new.image/components/ogp-dialog"
import { useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  imageBase64: string
  setOgpBase64: (imageBase64: string) => void
  ogpBase64: string
}

/**
 * OGPフォーム
 */
export function PostFormItemOgp(props: Props) {
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

  const t = useTranslation()

  return (
    <>
      <OgpDialog
        imageBase64={props.imageBase64}
        setResultImage={props.setOgpBase64}
      >
        <div className="cursor m-auto block transform cursor-pointer rounded-b bg-zinc-800 transition-all duration-300 hover:bg-zinc-700">
          <div className="m-auto flex items-center justify-center space-x-2 rounded-md">
            <div className="m-4">
              <img
                alt="adjust-thumbnail"
                src={displayImage}
                className={"max-w-24 rounded-md"}
              />
            </div>
            <p className="text-white">
              {" "}
              {t(
                "SNSシェア時のサムネイル調整",
                "Adjust the thumbnail when sharing on SNS",
              )}
            </p>
          </div>
        </div>
      </OgpDialog>
    </>
  )
}
