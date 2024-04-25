import type { TSortableItem } from "@/_components/drag/sortable-item"
import { SortableItems } from "@/_components/drag/sortable-items"
import {} from "@dnd-kit/core"
import { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone-esm"

type Props = {
  onChange: (imageBase64List: string[]) => void
}

/**
 * ドラッグ可能な複数画像選択
 * @param props
 * @returns
 */
const ImagesInput = (props: Props) => {
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

  const { getRootProps, getInputProps } = useDropzone({
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
      acceptedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target) {
            const imageDataURL = event.target.result
            if (imageDataURL) {
              setItems((prevItems) => [
                ...(prevItems ?? []),
                {
                  id: prevItems?.length ?? 0,
                  content: imageDataURL as string,
                } as TSortableItem,
              ])

              props.onChange(items?.map((item) => item.content as string) ?? [])

              console.log("items", items)
            }
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
          {...getInputProps()}
        />
        <p>画像／動画を追加</p>
      </div>
      <SortableItems
        items={items ?? []}
        setItems={setItems}
        setIndexList={setIndexList}
      />
    </>
  )
}

export default ImagesInput
