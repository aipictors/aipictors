import type { TSortableItem } from "~/components/drag/sortable-item"
import { SortableItems } from "~/components/drag/sortable-items"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import {
  getExtractInfoFromPNG,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"
import { VideoItem } from "~/routes/($lang)._main.new.image/components/video-item"
import { PencilLineIcon, PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  indexList: number[]
  items: TSortableItem[]
  videoFile: File | null
  isOnlyMove?: boolean
  maxItemsCount?: number
  setItems(items: TSortableItem[]): void
  setIndexList(value: number[]): void
  setThumbnailBase64(thumbnailBase64: string | null): void
  setOgpBase64?(ogpBase64: string | null): void
  setIsThumbnailLandscape?(isThumbnailLandscape: boolean): void
  onVideoChange(videoFile: File | null): void
  onChangePngInfo?(pngInfo: PNGInfo): void
  onMosaicButtonClick?(content: string): void
  onChangeItems(items: TSortableItem[]): void
  onChangeIndexList?(indexList: number[]): void
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export function PostFormItemDraggableImagesAndVideo(props: Props) {
  const t = useTranslation()

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
      if (
        props.items[0].content &&
        props.items[0].content !== nowHeadImageBase64
      ) {
        updateThumbnail()
        setNowHeadImageBase64(props.items[0].content)
      }
    } else {
      updateThumbnail()
      setNowHeadImageBase64("")
    }
    if (props.items.length === 0) {
      if (props.setOgpBase64) {
        props.setOgpBase64(null)
      }
      if (props.setIsThumbnailLandscape) {
        props.setIsThumbnailLandscape(false)
      }
      if (props.setThumbnailBase64) {
        props.setThumbnailBase64(null)
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
      if (
        !webpDataURL &&
        props.items &&
        props.items.length > 0 &&
        props.items[0].content
      ) {
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
        img.src = base64 ?? ""
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
        toast(
          t(
            `最大${props.maxItemsCount}までです`,
            `Up to ${props.maxItemsCount} items allowed`,
          ),
        )
        return
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      acceptedFiles.forEach(async (file) => {
        if (file.type === "video/mp4") {
          if (file.size > 32 * 1024 * 1024) {
            toast(
              t(
                "動画のサイズは32MB以下にしてください",
                "Video size should be under 32MB",
              ),
            )
            return
          }
          const video = document.createElement("video")

          video.src = URL.createObjectURL(file)
          video.onloadedmetadata = () => {
            if (video.duration > 12) {
              toast(
                t(
                  "動画は12秒以下にしてください",
                  "Video length should be under 12 seconds",
                ),
              )
              return
            }

            props.onVideoChange(file)

            props.setItems([])
            props.onChangeItems([])

            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext("2d")

            const time = video.duration / 2
            video.currentTime = time
            video.onseeked = () => {
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
              const thumbnailUrl = canvas.toDataURL()

              updateThumbnail(thumbnailUrl)
            }
          }
        } else {
          if (
            props.maxItemsCount &&
            props.maxItemsCount < props.items.length + 1
          ) {
            toast(
              t(
                `最大${props.maxItemsCount}までです`,
                `Up to ${props.maxItemsCount} items allowed`,
              ),
            )
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
          "h-[100%] w-[100%] border-2 border-zinc-800",
          isHovered ? "border-2 border-clear-bright-blue" : "",
        )}
      >
        {!props.isOnlyMove && <input id="images_input" {...getInputProps()} />}
        {props.items.length === 0 && !props.isOnlyMove && (
          <>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="m-auto mt-4 mb-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white"
              onClick={() => {
                const inputElement = document.getElementById(
                  "images_input",
                ) as HTMLInputElement
                if (inputElement) {
                  inputElement.click()
                }
              }}
            >
              <p className="font-bold">{t("画像を追加", "Add Image")}</p>
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
              className="absolute bottom-2 left-2 size-6 md:h-8 md:w-8"
              size={"icon"}
              onClick={() => {}}
            >
              <PencilLineIcon className="size-4 md:h-6 md:w-6" />
            </Button>
          }
          onClickOptionButton={(index) => {
            if (props.onMosaicButtonClick && props.items[index].content) {
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
                className="flex size-32 cursor-pointer items-center justify-center rounded-md bg-zinc-600 hover:opacity-80 dark:bg-zinc-700"
              >
                <PlusIcon className="size-12" />
              </div>
            )
          }
        />
        {!props.items.length && (
          <div className="m-4 flex flex-col text-white">
            <p className="text-center text-sm">
              {t(
                "JPEG、PNG、GIF、WEBP、BMP、MP4",
                "JPEG, PNG, GIF, WEBP, BMP, MP4",
              )}
            </p>
            <p className="text-center text-sm">
              {t(
                "1枚32MB以内、最大200枚、動画は32MB、12秒まで",
                "Max 32MB per file, up to 200 files, videos under 32MB and 12 seconds",
              )}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
