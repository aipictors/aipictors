import type { TSortableItem } from "~/components/drag/sortable-item"
import { SortableItems } from "~/components/drag/sortable-items"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import {
  getExtractInfoFromPNG,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"
import { PencilLineIcon, PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  indexList: number[]
  items: TSortableItem[]
  isOnlyMove?: boolean
  maxItemsCount?: number
  setItems(items: TSortableItem[]): void
  setIndexList(value: number[]): void
  setThumbnailBase64(thumbnailBase64: string | null): void
  setOgpBase64?(ogpBase64: string | null): void
  setIsThumbnailLandscape?(isThumbnailLandscape: boolean): void
  onChangePngInfo?(pngInfo: PNGInfo): void
  onMosaicButtonClick?(content: string): void
  onChangeItems(items: TSortableItem[]): void
  onChangeIndexList?(indexList: number[]): void
  onInputFiles?: (files: FileList) => void
  submitText?: string
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export function PostFormItemDraggableImages(props: Props) {
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
   * クリップボードから画像貼り付けできるようにする
   */
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const activeElement = document.activeElement
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return
      }

      if (props.isOnlyMove) return

      const items = event.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image")) {
          const file = item.getAsFile()
          if (file && file.size <= maxSize) {
            const reader = new FileReader()
            reader.onload = (e) => {
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
              img.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
            toast("画像をクリップボードから貼り付けました")
          } else {
            toast(
              t(
                "32MB以内の画像を貼り付けてください",
                "Please paste an image under 32MB",
              ),
            )
          }
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [])

  /**
   * 作品サムネイルを更新する
   * @param webpDataURL
   */
  const updateThumbnail = (webpDataURL: string | null = null) => {
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
            `Maximum ${props.maxItemsCount} items allowed`,
          ),
        )
        return
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      acceptedFiles.forEach(async (file) => {
        if (
          props.maxItemsCount &&
          props.maxItemsCount < props.items.length + 1
        ) {
          toast(
            t(
              `最大${props.maxItemsCount}までです`,
              `Maximum ${props.maxItemsCount} items allowed`,
            ),
          )
          return
        }

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

        if (props.onInputFiles) {
          props.onInputFiles(inputElement.files)
        }
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
          props.items.length ? "" : "rounded-b",
        )}
      >
        {!props.isOnlyMove && <input id="images_input" {...getInputProps()} />}
        {props.items.length === 0 && !props.isOnlyMove && (
          // biome-ignore lint/complexity/noUselessFragments: <explanation>
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
              {props.submitText ? (
                <p className="font-bold">{props.submitText}</p>
              ) : (
                <p className="font-bold">{t("画像を追加", "Add Image")}</p>
              )}
            </div>
          </>
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
            props.items.length !== props.maxItemsCount &&
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
          <div className="m-4 flex flex-col rounded-b text-white">
            <p className="text-center text-sm">{"JPEG、PNG、GIF、WEBP、BMP"}</p>
            <p className="text-center text-sm">
              {t(
                "1枚32MB以内、最大200枚",
                "Up to 32MB per image, max 200 images",
              )}
            </p>
            <p className="text-center text-sm">
              {"クリップボードから貼り付けも可能"}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
