import { OgpDialog } from "@/routes/($lang)._main.new.image/_components/ogp-dialog"

type Props = {
  imageBase64: string
  setOgpBase64: (imageBase64: string) => void
  ogpBase64: string
}

/**
 * OGPフォーム
 * @returns
 */
export const OgpInput = (props: Props) => {
  const defaultImageUrl =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/none-select-og.jpg"

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
                src={props.ogpBase64 ? props.ogpBase64 : defaultImageUrl}
                className={"max-w-24 rounded-md"}
              />
            </div>
            <p>SNSシェア時のサムネイル調整</p>
          </div>
        </div>
      </OgpDialog>
    </>
  )
}
