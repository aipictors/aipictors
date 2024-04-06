"use client"

import { AutoResizeTextarea } from "@/app/_components/auto-resize-textarea"
import { uploadFile } from "@/app/_utils/upload-file"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { SetStateAction } from "react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"

const NewImageForm = () => {
  // 画像の状態を保持するための型
  type ImageItem = {
    id: string
    url: string
  }

  /**
   * 画像の配列を保持する状態
   */
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])
  /**
   * ホバー状態を管理
   */
  const [isHovered, setIsHovered] = useState(false)
  const [ageRestriction, setAgeRestriction] = useState("全年齢")
  const [publicMode, setPublicMode] = useState("全公開")
  const [taste, setTaste] = useState("イラスト系")
  const [aiUsed, setAiUsed] = useState("NovelAI")
  const [reservationDate, setReservationDate] = useState("")
  const [reservationTime, setReservationTime] = useState("")

  const maxSize = 32 * 1024 * 1024

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
              setSelectedImages((prevSelectedImages) => [
                ...prevSelectedImages,
                imageDataURL as never,
              ])
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
    onDropRejected: (fileRejections) => {
      setIsHovered(false)

      // biome-ignore lint/complexity/noForEach: <explanation>
      fileRejections.forEach((file) => {
        // biome-ignore lint/complexity/noForEach: <explanation>
        file.errors.forEach((err) => {
          if (err.code === "file-too-large") {
            console.warn(err)
          }
        })
      })
    },
  })

  // Create sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  )

  /**
   * @param event
   * biome-ignore lint: TODO: 修正
   */
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const reorderedImages = arrayMove(selectedImages, active.id, over.id)
      setSelectedImages(reorderedImages)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const newSelectedImages = selectedImages.filter(
      (_, index) => index !== indexToRemove,
    )
    setSelectedImages(newSelectedImages)
  }

  const handleAgeRestrictionChange = (value: string) => {
    setAgeRestriction(value)
  }

  const handlePublicModeChange = (value: string) => {
    setPublicMode(value)
  }

  const handleTasteChange = (value: string) => {
    setTaste(value)
  }

  const handleAiUsedChange = (value: string) => {
    setAiUsed(value)
  }

  const handleReservationDateChange = (event: {
    target: { value: SetStateAction<string> }
  }) => {
    setReservationDate(event.target.value)
  }

  const handleReservationTimeChange = (event: {
    target: { value: SetStateAction<string> }
  }) => {
    setReservationTime(event.target.value)
  }

  const handleUpload = async () => {
    const inputElement = document.getElementById("image_input") as HTMLElement
    if (inputElement) {
      const selectedFiles: FileList = (inputElement as HTMLInputElement)
        .files as FileList
      try {
        const url = await uploadFile(selectedFiles[0])
      } catch (error) {
        // エラーハンドリング
        console.error("アップロードエラー:", error)
      }
    } else {
      console.error("ファイルが選択されていません。")
    }
  }

  /**
   * ドラッグアンドドロップで並び替えできるようにする
   * @param props
   * @returns
   * biome-ignore lint: TODO: 修正
   */
  const SelectedImageItem = (props: any) => {
    // ドラッグアンドドロップで並び替えできるようにする
    const { attributes, listeners, setNodeRef } = useSortable({
      id: `image-${props.id}`,
    })
    return (
      <div
        {...attributes}
        {...listeners}
        className="relative m-4 h-24 w-24 overflow-hidden rounded md:h-60 md:w-60"
      >
        <img
          src={props.image}
          alt={`選択された画像 ${props.id + 1}`}
          className="h-24 w-24 object-cover md:h-60 md:w-60"
        />
        <Button
          className="absolute top-0 right-0 bg-white text-red-500 text-sm hover:bg-gray-200"
          onClick={() => handleRemoveImage(props.id)}
        >
          {"✕"}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div>
        <div
          className={`items-center bg-black${
            isHovered ? "border-2 border-white border-dashed" : ""
          }`}
        >
          <div
            className="m-4 flex cursor-pointer flex-col items-center justify-center rounded bg-blue-500 p-4 text-white"
            {...getRootProps()}
          >
            <input
              multiple={true}
              id="image_input"
              type="file"
              accept="image/*"
              {...getInputProps()}
            />
            <p>画像／動画を追加</p>
          </div>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex flex-wrap justify-center">
              <SortableContext
                items={selectedImages}
                strategy={verticalListSortingStrategy}
              >
                {selectedImages.map((imageItem) => (
                  <SelectedImageItem
                    key={imageItem.id}
                    image={imageItem.url}
                    id={imageItem.id}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
          <div className="m-4 flex flex-col text-white">
            <p className="text-sm">JPEG、PNG、GIF、WEBP、BMP、MP4</p>
            <p className="text-sm">
              1枚32MB以内、最大200枚、動画は32MB、12秒まで
            </p>
          </div>
        </div>

        <div>
          <div className="flex flex-col">
            <p className="text-sm">タイトル</p>
            <Input
              id="title_input"
              minLength={1}
              maxLength={120}
              required
              type="text"
              name="title"
              placeholder="タイトル"
              className="w-full"
            />
          </div>

          <div className="mt-4 flex flex-col">
            <p className="text-sm">キャプション</p>
            <AutoResizeTextarea
              maxLength={3000}
              placeholder="キャプション"
              className="w-full"
            />
          </div>

          <div className="mt-4 flex flex-col">
            <p className="text-sm">年齢制限</p>
            <div
            // onChange={handleAgeRestrictionChange}
            // value={ageRestriction}
            >
              <div className="flex flex-col space-y-2">
                <input type="radio" value="全年齢" name="ageRestriction" />
                全年齢
                <input type="radio" value="R-15" name="ageRestriction" />
                R-15
                <input type="radio" value="R-18" name="ageRestriction" />
                R-18
                <input type="radio" value="R-18G" name="ageRestriction" />
                R-18G
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col">
            <p className="text-sm">公開モード</p>
            <div
            // onChange={handlePublicModeChange}
            // value={publicMode}
            >
              <div className="flex flex-col space-y-2">
                <input type="radio" value="全公開" name="publicMode" />
                全公開
                <input
                  type="radio"
                  value="限定公開(URLのみアクセス可)"
                  name="publicMode"
                />
                限定公開(URLのみアクセス可)
                <input type="radio" value="新着非表示" name="publicMode" />
                新着非表示
                <input type="radio" value="アーカイブ" name="publicMode" />
                アーカイブ
                <input type="radio" value="下書き" name="publicMode" />
                下書き
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm">テイスト</p>
            <select
              onChange={(e) => handleTasteChange(e.target.value)}
              value={taste}
            >
              <option value="イラスト系">イラスト系</option>
              <option value="セミリアル系">セミリアル系</option>
              <option value="リアル系">リアル系</option>
            </select>
          </div>
          <div className="mt-4 flex flex-col">
            <p className="text-sm">使用AI</p>
            <select
              onChange={(e) => handleAiUsedChange(e.target.value)}
              value={aiUsed}
            >
              <option value="NovelAI">NovelAI</option>
              <option value="そのほか">そのほか</option>
            </select>
          </div>
          <div className="mt-4 flex flex-col">
            <p className="text-sm">予約投稿</p>
            <div className="block md:flex">
              <Input
                type="date"
                value={reservationDate}
                onChange={handleReservationDateChange}
                className="mt-2 mr-0 md:mt-0 md:mr-2"
              />
              <Input
                type="time"
                value={reservationTime}
                onChange={handleReservationTimeChange}
              />
            </div>
          </div>
          {/* Submit button */}
          <Button type="submit" onClick={handleUpload}>
            投稿
          </Button>
        </div>
      </div>
    </>
  )
}

export default NewImageForm
