import type { TSortableItem } from "@/_components/drag/sortable-item"
import { SortableItems } from "@/_components/drag/sortable-items"
import { Button } from "@/_components/ui/button"
import { cn } from "@/_lib/cn"
import {
  getExtractInfoFromPNG,
  type PNGInfo,
} from "@/_utils/get-extract-info-from-png"
import { VideoItem } from "@/routes/($lang)._main.new.image/_components/video-item"
import {} from "@dnd-kit/core"
import { PencilLineIcon, PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"

type Props = {
  indexList: number[] // 画像の並び順
  items: TSortableItem[] // 画像のリスト
  videoFile: File | null // 動画ファイル
  isOnlyMove?: boolean // 移動可能のみかどうか（削除、追加不可能）
  maxItemsCount?: number // 最大画像数
  setItems: React.Dispatch<React.SetStateAction<TSortableItem[]>>
  setIndexList: React.Dispatch<React.SetStateAction<number[]>>
  setThumbnailBase64?: (thumbnailBase64: string) => void
  setOgpBase64?: (ogpBase64: string) => void
  setIsThumbnailLandscape?: (isThumbnailLandscape: boolean) => void
  onVideoChange: (videoFile: File | null) => void
  onChangePngInfo?: (pngInfo: PNGInfo) => void
  onMosaicButtonClick?: (content: string) => void
  onChangeItems: (items: TSortableItem[]) => void
  onChangeIndexList?: (indexList: number[]) => void
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export const DraggableImagesAndVideoInput = (props: Props) => {
  // 先頭の画像
  const [nowHeadImageBase64, setNowHeadImageBase64] = useState("")

  // ファイルの最大サイズ(バイト単位)
  const maxSize = 32 * 1024 * 1024

  // ドラッグ中して画像一覧にホバー中かどうか
  const [isHovered, setIsHovered] = useState(false)

  /**
   * 選択中の画像一覧が変更されたときはサムネイルを更新する
   */
  useEffect(() => {
    // 違いがあったらサムネイルを更新
    if (props.items.length) {
      if (props.items[0].content !== nowHeadImageBase64) {
        updateThumbnail()
        setNowHeadImageBase64(props.items[0].content)
      }
    } else {
      updateThumbnail()
      setNowHeadImageBase64("")
    }
    if (props.items.length === 0) {
      if (props.setOgpBase64) {
        props.setOgpBase64("")
      }
      if (props.setIsThumbnailLandscape) {
        props.setIsThumbnailLandscape(false)
      }
      if (props.setThumbnailBase64) {
        props.setThumbnailBase64("")
      }
    }
  }, [props.items])

  /**
   * 作品サムネイルを更新する
   * @param webpDataURL
   */
  const updateThumbnail = (webpDataURL: string | null = null) => {
    // 先頭の要素を並び替えした場合はサムネイルを0番目の画像が存在したらその画像に設定する
    if (props.setThumbnailBase64) {
      if (!webpDataURL && props.items && props.items.length > 0) {
        props.setThumbnailBase64(props.items[0].content)
      } else {
        props.setThumbnailBase64(webpDataURL ? webpDataURL : "")
      }
    }
    // 先頭の要素を並び替えした場合はサムネイルを0番目の画像が存在したらその画像に設定する
    if (props.setOgpBase64) {
      props.setOgpBase64("")
    }

    if (props.setIsThumbnailLandscape) {
      if ((props.items && props.items.length > 0) || webpDataURL) {
        const base64 = webpDataURL ? webpDataURL : props.items[0].content
        const img = new Image()
        img.src = base64
        img.onload = () => {
          if (props.setIsThumbnailLandscape) {
            props.setIsThumbnailLandscape(img.width > img.height)
          }
        }
      } else {
        props.setIsThumbnailLandscape(false)
      }
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    minSize: 0,
    maxSize: maxSize,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "video/mp4": [".mp4", ".MP4", ".Mp4"],
    },
    noClick: true,
    onDrop: (acceptedFiles) => {
      if (props.isOnlyMove) {
        return
      }

      if (props.maxItemsCount && props.maxItemsCount < acceptedFiles.length) {
        toast(`最大${props.maxItemsCount}までです`)
        return
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      acceptedFiles.forEach(async (file) => {
        // 動画が選択された場合は画像一覧をリセットして、動画をセットする
        if (file.type === "video/mp4") {
          // サイズと再生時間のチェック
          if (file.size > 32 * 1024 * 1024) {
            toast("動画のサイズは32MB以下にしてください")
            return
          }
          const video = document.createElement("video")

          video.src = URL.createObjectURL(file)
          video.onloadedmetadata = () => {
            if (video.duration > 12) {
              toast("動画は12秒以下にしてください")
              return
            }

            // 動画をセット
            props.onVideoChange(file)

            // アイテムリストに動画のみをセット
            props.setItems([])
            props.onChangeItems([])

            // 動画のサムネイルを生成するためのCanvasを作成
            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")

            // タイムラインで指定できるライブラリを使ってサムネイルを取得
            const time = video.duration / 2
            video.currentTime = time
            video.onseeked = () => {
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
              const thumbnailUrl = canvas.toDataURL() // サムネイルをDataURL形式で取得

              updateThumbnail(thumbnailUrl)
            }
          }
        } else {
          if (
            props.maxItemsCount &&
            props.maxItemsCount < props.items.length + 1
          ) {
            toast(`最大${props.maxItemsCount}までです`)
            return
          }

          props.onVideoChange(null)

          if (props.items.length === 0 && file.type === "image/png") {
            const pngInfo = await getExtractInfoFromPNG(file)
            if (props.onChangePngInfo) {
              props.onChangePngInfo(pngInfo)
            }
          }

          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target) {
              const img = new Image()
              img.onload = () => {
                const canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d")
                ctx?.drawImage(img, 0, 0)
                const webpDataURL = canvas.toDataURL("image/webp")
                props.items.push({
                  id: props.items.length,
                  content: webpDataURL,
                })
                props.onChangeItems([...props.items])
                updateThumbnail()
              }
              img.src = event.target.result as string
            }
          }
          reader.readAsDataURL(file)
        }
      })
      // ここで input の id が image_inputの要素に file をセットする
      const inputElement = document.getElementById(
        "images_input",
      ) as HTMLInputElement
      if (inputElement) {
        const fileList: File[] = []
        // biome-ignore lint/complexity/noForEach: <explanation>
        acceptedFiles.forEach((file) => {
          fileList.push(file)
        })
        const newFileList = new DataTransfer()
        // biome-ignore lint/complexity/noForEach: <explanation>
        fileList.forEach((file) => {
          newFileList.items.add(file)
        })
        inputElement.files = newFileList.files
      }
    },
    onDragEnter: () => {
      setIsHovered(true)
    },
    onDragLeave: () => {
      setIsHovered(false)
    },
    onDropAccepted: () => {
      setIsHovered(false)
    },
    disabled: props.isOnlyMove,
  })

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "h-[100%] w-[100%] border-2 border-gray-800",
          isHovered ? "border-2 border-clear-bright-blue" : "",
        )}
      >
        {!props.isOnlyMove && <input id="images_input" {...getInputProps()} />}
        {props.items.length === 0 && !props.isOnlyMove && (
          <>
            <div className="m-auto mt-4 mb-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white">
              {" "}
              <p className="font-bold">画像／動画を追加</p>
            </div>
          </>
        )}
        {props.videoFile && (
          <VideoItem
            videoFile={props.videoFile}
            onDelete={() => {
              if (!props.isOnlyMove) {
                props.onVideoChange(null)
                props.onChangeItems([])
                if (props.onChangeIndexList) {
                  props.onChangeIndexList([])
                }
              }
            }}
          />
        )}

        <SortableItems
          items={props.items}
          isDeletable={!props.isOnlyMove}
          setItems={props.setItems}
          setIndexList={props.setIndexList}
          optionalButton={
            <Button
              className="absolute bottom-2 left-2 h-6 w-6 md:h-8 md:w-8"
              size={"icon"}
              onClick={() => {}}
            >
              <PencilLineIcon className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
          }
          onClickOptionButton={(index) => {
            if (props.onMosaicButtonClick) {
              props.onMosaicButtonClick(props.items[index].content)
            }
          }}
          dummyEnableDragItem={
            props.items.length !== 0 &&
            !props.isOnlyMove && (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                onClick={() => {
                  const inputElement = document.getElementById(
                    "images_input",
                  ) as HTMLInputElement
                  if (inputElement) {
                    inputElement.click()
                  }
                }}
                className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-md bg-gray-600 hover:opacity-80 dark:bg-gray-700"
              >
                <PlusIcon className="h-12 w-12" />
              </div>
            )
          }
        />

        {!props.items.length && (
          <div className="m-4 flex flex-col text-white">
            <p className="text-center text-sm">
              JPEG、PNG、GIF、WEBP、BMP、MP4
            </p>
            <p className="text-center text-sm">
              1枚32MB以内、最大200枚、動画は32MB、12秒まで
            </p>
          </div>
        )}
      </div>
    </>
  )
}
