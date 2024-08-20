import {
  InPaintingImageForm,
  InPaintingImageFormFragment,
  InPaintingImageFormTaskFragment,
} from "~/routes/($lang).generation._index/components/submission-view/InPaintingImageForm"
import { useEffect, useState } from "react"
import FullScreenContainer from "~/components/full-screen-container"
import PrivateImagePaintCanvas from "~/routes/($lang).generation._index/components/submission-view/private-image-paint-canvas"
import { graphql } from "gql.tada"

type Props = {
  isOpen: boolean
  onClose(): void
  taskId: string
  token: string
  imageUrl: string
  userNanoid: string | null
  configSeed: number
  configSteps: number
  configSampler: string
  configScale: number
  configSizeType: string
  configModel: string | null
  configVae: string | null
  configClipSkip: number
}

/**
 * インペイントダイアログ
 */
export function InPaintingDialog(props: Props) {
  const [maskBase64, setMaskBase64] = useState("")

  const [maskImage64, setMaskImage64] = useState("")

  const [isDrawing, setIsDrawing] = useState(false)

  /**
   * base64画像の色を反転させて、透明部分は黒色にする
   * @param base64Image
   * @returns
   */
  const invertImageColors = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // ブラウザ環境でのみ実行
      if (typeof document === "undefined") {
        reject("この関数はブラウザでのみ使用可能です")
        return
      }

      // 新しいImageオブジェクトを作成し、Base64画像を読み込む
      const img = new Image()
      img.src = base64Image

      // 画像の読み込みが完了したら処理を行う
      img.onload = () => {
        // 新しいCanvas要素を作成
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject("Canvasコンテキストの取得に失敗しました")
          return
        }

        // Canvasのサイズを画像と同じに設定
        canvas.width = img.width
        canvas.height = img.height

        // 画像をCanvasに描画
        ctx.drawImage(img, 0, 0)

        // 画像データを取得
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 色を反転させる
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) {
            // 透明なピクセルの場合は黒に設定
            data[i] = 0 // Red
            data[i + 1] = 0 // Green
            data[i + 2] = 0 // Blue
            data[i + 3] = 255 // Blue
          } else {
            // 非透明なピクセルの場合は色を反転
            data[i] = 255 - data[i] // Red
            data[i + 1] = 255 - data[i + 1] // Green
            data[i + 2] = 255 - data[i + 2] // Blue
          }
          // アルファ値は変更しない
        }
        // Canvasに反転した画像データを描画
        ctx.putImageData(imageData, 0, 0)

        // CanvasからBase64画像を取得
        const invertedBase64 = canvas.toDataURL()

        // 反転したBase64画像を返す
        resolve(invertedBase64)
      }

      img.onerror = () => {
        reject("画像の読み込みに失敗しました")
      }
    })
  }

  /**
   * base64画像を二値化して、透明部分は黒色にする
   * @param base64Image
   * @returns
   */
  const binarizeImage = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // ブラウザ環境でのみ実行
      if (typeof document === "undefined") {
        reject("この関数はブラウザでのみ使用可能です")
        return
      }

      // 新しいImageオブジェクトを作成し、Base64画像を読み込む
      const img = new Image()
      img.src = base64Image

      // 画像の読み込みが完了したら処理を行う
      img.onload = () => {
        // 新しいCanvas要素を作成
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject("Canvasコンテキストの取得に失敗しました")
          return
        }

        // Canvasのサイズを画像と同じに設定
        canvas.width = img.width
        canvas.height = img.height

        // 画像をCanvasに描画
        ctx.drawImage(img, 0, 0)

        // 画像データを取得
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // 二値化と透明度の除去処理
        for (let i = 0; i < data.length; i += 4) {
          const brightness =
            0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          const threshold = 128 // 閾値
          const color = brightness < threshold ? 0 : 255
          data[i] = data[i + 1] = data[i + 2] = color
          data[i + 3] = 255 // アルファ値を255に設定して不透明に
        }
        // Canvasに二値化した画像データを描画
        ctx.putImageData(imageData, 0, 0)

        // CanvasからBase64画像を取得
        const binarizedBase64 = canvas.toDataURL()

        // 二値化したBase64画像を返す
        resolve(binarizedBase64)
      }

      img.onerror = () => {
        reject("画像の読み込みに失敗しました")
      }
    })
  }

  useEffect(() => {
    if (maskBase64) {
      invertImageColors(maskBase64).then((invertedBase64: string) => {
        binarizeImage(invertedBase64).then((invertedBase64: string) => {
          setMaskImage64(invertedBase64)
        })
      })
    }
  }, [maskBase64])

  return (
    props.isOpen && (
      <>
        <FullScreenContainer onClose={props.onClose} enabledScroll={isDrawing}>
          <div className="h-[100%] w-[80%]">
            <PrivateImagePaintCanvas
              fileName={props.imageUrl}
              token={props.token}
              onChangeBrushImageBase64={(value) => {
                setMaskBase64(value)
              }}
              setIsDrawing={(value) => {
                setIsDrawing(value)
                console.log(isDrawing)
              }}
            />
          </div>
          <InPaintingImageForm
            taskId={props.taskId}
            token={props.token}
            imageUrl={props.imageUrl}
            userNanoid={props.userNanoid}
            configSeed={props.configSeed}
            configSteps={props.configSteps}
            configSampler={props.configSampler}
            configScale={props.configScale}
            configSizeType={props.configSizeType}
            configModel={props.configModel}
            configVae={props.configVae}
            configClipSkip={props.configClipSkip}
            onClose={props.onClose}
            maskBase64={maskImage64}
          />
        </FullScreenContainer>
      </>
    )
  )
}

export const InPaintingImageDialogFragment = graphql(
  `fragment InPaintingImageDialog on ImageGenerationResultNode @_unmask {
    ...InPaintingImageForm
  }`,
  [InPaintingImageFormFragment],
)

export const InPaintingImageDialogTaskFragment = graphql(
  `fragment InPaintingImageDialogTask on ImageGenerationTaskNode @_unmask {
    ...InPaintingImageFormTask
  }`,
  [InPaintingImageFormTaskFragment],
)
