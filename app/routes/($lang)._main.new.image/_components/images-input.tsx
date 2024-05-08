import type { TSortableItem } from "@/_components/drag/sortable-item"
import { SortableItems } from "@/_components/drag/sortable-items"
import {
  type PNGInfo,
  getExtractInfoFromPNG,
} from "@/_utils/get-extract-info-from-png"
import {} from "@dnd-kit/core"
import { useState } from "react"
import { useDropzone } from "react-dropzone"

type Props = {
  onChange: (imageBase64List: string[]) => void
  onChangePngInfo?: (pngInfo: PNGInfo) => void
  onDelete?: (id: number) => void
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
export const ImagesInput = (props: Props) => {
  const maxSize = 32 * 1024 * 1024

  const [items, setItems] = useState<TSortableItem[]>([])

  const [indexList, setIndexList] = useState<number[]>([])

  const [isHovered, setIsHovered] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    minSize: 1,
    maxSize: maxSize,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
    },
    onDrop: (acceptedFiles) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      acceptedFiles.forEach(async (file) => {
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
              // Convert the image to WebP format
              const webpDataURL = canvas.toDataURL("image/webp")

              items.push({
                id: items.length,
                content: webpDataURL,
              })

              props.onChange(items?.map((item) => item.content) ?? [])
            }
            img.src = event.target.result as string
          }
        }
        reader.readAsDataURL(file)
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
          multiple={true}
          id="image_input"
          type="file"
          accept="image/*"
          maxLength={maxSize}
          className="absolute bottom-0 h-[100%] w-[100%] opacity-0"
          {...getInputProps()}
        />
        <p className="font-bold">画像／動画を追加</p>
      </div>
      <SortableItems
        items={items ?? []}
        setItems={setItems}
        setIndexList={setIndexList}
        onDelete={(index) => {
          if (props.onDelete) {
            props.onDelete(index)
          }
        }}
      />
    </>
  )
}
