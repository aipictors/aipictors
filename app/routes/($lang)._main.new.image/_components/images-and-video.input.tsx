import type { TSortableItem } from "@/_components/drag/sortable-item"
import { SortableItems } from "@/_components/drag/sortable-items"
import { Button } from "@/_components/ui/button"
import { cn } from "@/_lib/utils"
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
  onVideoChange: (videoFile: File | null) => void
  onChangePngInfo?: (pngInfo: PNGInfo) => void
  onDelete?: (id: number) => void
  onMosaicButtonClick?: (id: number) => void
  items?: TSortableItem[]
  onChangeItems: (items: TSortableItem[]) => void
  onChangeIndexList?: (indexList: number[]) => void
  indexList: number[]
  setIndexList: React.Dispatch<React.SetStateAction<number[]>>
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export const ImagesAndVideoInput = (props: Props) => {
  const maxSize = 32 * 1024 * 1024

  const [items, setItems] = useState<TSortableItem[]>(props.items ?? [])

  useEffect(() => {
    if (props.onChangeItems) {
      props.onChangeItems(items)
    }
  }, [items])

  useEffect(() => {
    if (props.onChangeIndexList) {
      props.onChangeIndexList(props.indexList)
    }
  }, [props.indexList])

  // useEffect(() => {
  //   setItems(props.items ?? [])
  // }, [props.items])

  const [isHovered, setIsHovered] = useState(false)

  const [videoFile, setVideoFile] = useState<null | File>(null)

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
    onDrop: (acceptedFiles) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      acceptedFiles.forEach(async (file) => {
        if (file.type === "video/mp4") {
          if (file.size > 32 * 1024 * 1024) {
            toast("動画のサイズは32MB以下にしてください")
            return
          }
          // 12秒以内の動画でない場合はアラートを出す
          const video = document.createElement("video")
          video.src = URL.createObjectURL(file)
          video.onloadedmetadata = () => {
            if (video.duration > 12) {
              toast("動画は12秒以下にしてください")
              return
            }
            // 動画をセット
            props.onVideoChange(file)
            setVideoFile(file)
            // 画像はリセット
            setItems([
              {
                id: 0,
                content: "",
              } as TSortableItem,
            ])
          }
        } else {
          props.onVideoChange(null)
          setVideoFile(null)

          if (items.length === 0 && file.type === "image/png") {
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
                items.push({
                  id: items.length,
                  content: webpDataURL,
                })

                // props.onChange(items?.map((item) => item.content) ?? [])

                props.onChangeItems([...items])
              }
              img.src = event.target.result as string
            }
          }
          reader.readAsDataURL(file)
        }
      })
      // ここで input の id が image_inputの要素に file をセットする
      const inputElement = document.getElementById(
        "image_input",
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
  })

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "absolute top-0 left-0 h-[100%] w-[100%] border-2",
          isHovered ? "border-2 border-clear-bright-blue" : "",
        )}
      >
        <input {...getInputProps()} />
        {items.length === 0 && (
          <>
            <div className="m-auto mt-4 mb-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white">
              {" "}
              <p className="font-bold">画像／動画を追加</p>
            </div>
          </>
        )}
      </div>
      {items.length === 0 && <div className="h-24" />}
      {videoFile && (
        <VideoItem
          videoFile={videoFile}
          onDelete={() => {
            setVideoFile(null)
            props.onVideoChange(null)
            if (props.onDelete) {
              props.onDelete(0)
            }
            props.onChangeItems([])
            if (props.onChangeIndexList) {
              props.onChangeIndexList([])
            }
            setItems([])
          }}
        />
      )}

      <SortableItems
        items={items ?? []}
        setItems={setItems}
        setIndexList={props.setIndexList}
        onDelete={(deleteId) => {
          if (props.onDelete) {
            props.onDelete(deleteId)
          }
        }}
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
          if (props.onMosaicButtonClick) props.onMosaicButtonClick(index)
        }}
        dummyEnableDragItem={
          items.length !== 0 && (
            <div className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-md bg-gray-600 dark:bg-gray-700 hover:opacity-80">
              <PlusIcon className="h-12 w-12" />
            </div>
          )
        }
      />
    </>
  )
}
