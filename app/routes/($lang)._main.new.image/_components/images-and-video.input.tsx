import type { TSortableItem } from "@/_components/drag/sortable-item"
import { SortableItems } from "@/_components/drag/sortable-items"
import {
  type PNGInfo,
  getExtractInfoFromPNG,
} from "@/_utils/get-extract-info-from-png"
import { VideoItem } from "@/routes/($lang)._main.new.image/_components/video-item"
import {} from "@dnd-kit/core"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone-esm"
import { toast } from "sonner"

type Props = {
  onVideoChange: (videoFile: File | null) => void
  onChange: (imageBase64List: string[]) => void
  onChangePngInfo?: (pngInfo: PNGInfo) => void
  onDelete?: (id: number) => void
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export const ImagesAndVideoInput = (props: Props) => {
  const maxSize = 32 * 1024 * 1024

  const [items, setItems] = useState<TSortableItem[]>([])

  useEffect(() => {
    setItems([
      {
        id: 0,
        content: "",
      } as TSortableItem,
    ])
  }, [])

  const [indexList, setIndexList] = useState<number[]>([])

  const [isHovered, setIsHovered] = useState(false)

  const [firstImageBase64, setFirstImageBase64] = useState("")

  const [videoFile, setVideoFile] = useState<null | File>(null)

  useEffect(() => {
    setItems((prevItems) => {
      if (prevItems.length === 1) {
        return [
          {
            id: 0,
            content: firstImageBase64,
          },
        ]
      }
      return prevItems
    })
  }, [firstImageBase64])

  const { getRootProps, getInputProps } = useDropzone({
    minSize: 1,
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

          if (items.length === 1 && file.type === "image/png") {
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
                // Convert the image to WebP format
                const webpDataURL = canvas.toDataURL("image/webp")
                setItems((prevItems) => [
                  ...(prevItems ?? []),
                  {
                    id: prevItems?.length ?? 0,
                    content: webpDataURL,
                  },
                ])

                props.onChange(items?.map((item) => item.content) ?? [])

                if (items.length === 0) {
                  setFirstImageBase64(webpDataURL)
                }
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
        className="m-auto mt-4 mb-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white"
      >
        <input
          className="height-[64px] absolute opacity-0"
          multiple={true}
          id="image_input"
          type="file"
          accept="image/*"
          maxLength={maxSize}
          {...getInputProps()}
        />
        <p className="font-bold">画像／動画を追加</p>
      </div>

      {videoFile && (
        <VideoItem
          videoFile={videoFile}
          onDelete={() => {
            setVideoFile(null)
            props.onVideoChange(null)
          }}
        />
      )}

      <SortableItems
        items={items ?? []}
        setItems={setItems}
        setIndexList={setIndexList}
        onDelete={(index) => {
          if (props.onDelete) {
            props.onDelete(index)
          }
          if (items.length === 2) {
            setFirstImageBase64("")
          }
          console.log(firstImageBase64)
        }}
      />
    </>
  )
}