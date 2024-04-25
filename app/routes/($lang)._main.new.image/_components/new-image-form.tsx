import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { aiModelsQuery } from "@/_graphql/queries/model/models"
import { uploadFile } from "@/_utils/upload-file"
import CaptionInput from "@/routes/($lang)._main.new.image/_components/caption-input"
import DateInput from "@/routes/($lang)._main.new.image/_components/date-input"
import ModelInput from "@/routes/($lang)._main.new.image/_components/model-input"
import RatingInput from "@/routes/($lang)._main.new.image/_components/rating-input"
import TasteInput from "@/routes/($lang)._main.new.image/_components/taste-input"
import TitleInput from "@/routes/($lang)._main.new.image/_components/title-input"
import ViewInput from "@/routes/($lang)._main.new.image/_components/view-input"
import type { AiModel } from "@/routes/($lang)._main.new.image/_types/model"
import { useQuery } from "@apollo/client/index.js"
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
import { useDropzone } from "react-dropzone-esm"
import type { Tag } from "@/_components/tag/tag-input"
import TagsInput from "@/routes/($lang)._main.new.image/_components/tag-input"

const NewImageForm = () => {
  // 画像の状態を保持するための型
  type ImageItem = {
    id: string
    url: string
  }

  const { data: aiModels } = useQuery(aiModelsQuery, {
    variables: {
      limit: 124,
      offset: 0,
      where: {},
    },
    fetchPolicy: "cache-first",
  })

  const optionModels = aiModels
    ? (aiModels?.aiModels.map((model) => ({
        id: model.workModelId,
        name: model.name,
      })) as AiModel[])
    : []

  console.log(optionModels)

  /**
   * 画像の配列を保持する状態
   */
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])

  const [isHovered, setIsHovered] = useState(false)

  const [title, setTitle] = useState("")

  const [enTitle, setEnTitle] = useState("")

  const [caption, setCaption] = useState("")

  const [enCaption, setEnCaption] = useState("")

  const [tags, setTags] = useState<Tag[]>([])

  const [ratingRestriction, setRatingRestriction] = useState("G")

  const [viewMode, setViewMode] = useState("public")

  const [taste, setTaste] = useState("illust")

  const [aiUsed, setAiUsed] = useState("1")

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
      <div className="relative w-[100%]">
        <ScrollArea className="bg-gray-100 dark:bg-black">
          <div
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            className={`items-center mb-2 p-0 md:p-1 rounded bg-gray-800 ${
              isHovered ? "border-2 border-white border-dashed" : ""
            }`}
          >
            <div
              className="m-auto mt-4 flex w-48 cursor-pointer flex-col items-center justify-center rounded bg-clear-bright-blue p-4 text-white"
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
              <p className="text-center text-sm">
                JPEG、PNG、GIF、WEBP、BMP、MP4
              </p>
              <p className="text-center text-sm">
                1枚32MB以内、最大200枚、動画は32MB、12秒まで
              </p>
            </div>
          </div>
          <div className="p-2">
            <TitleInput setTitle={setTitle} />
            <CaptionInput setCaption={setCaption} />

            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <Button variant={"secondary"} className="w-full">
                    英語キャプションを入力
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <TitleInput label={"英語タイトル"} setTitle={setEnTitle} />
                  <CaptionInput
                    label={"英語キャプション"}
                    setCaption={setEnCaption}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <RatingInput
              rating={ratingRestriction}
              setRating={setRatingRestriction}
            />
            <ViewInput viewMode={viewMode} setViewMode={setViewMode} />
            <TasteInput taste={taste} setTaste={setTaste} />
            <ModelInput
              model={aiUsed}
              models={optionModels}
              setModel={setAiUsed}
            />
            <DateInput
              date={reservationDate}
              time={reservationTime}
              setDate={setReservationDate}
              setTime={setReservationTime}
            />
            <TagsInput tags={tags} setTags={setTags} />
          </div>
        </ScrollArea>
        <Button
          className="bottom-0 w-full"
          type="submit"
          onClick={handleUpload}
        >
          投稿
        </Button>
      </div>
    </>
  )
}

export default NewImageForm
