"use client"
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react"
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
import { AutoResizeTextarea } from "app/components/AutoResizeTextarea"
import { uploadFile } from "app/utils/uploadFile"
import type { SetStateAction } from "react"
import { useState } from "react"
import { useDropzone } from "react-dropzone"

const NewImageForm = () => {
  const [selectedImages, setSelectedImages] = useState([]) // 画像の配列を保持する状態
  const [isHovered, setIsHovered] = useState(false) // ホバー状態を管理
  const [ageRestriction, setAgeRestriction] = useState("全年齢")
  const [publicMode, setPublicMode] = useState("全公開")
  const [taste, setTaste] = useState("イラスト系")
  const [aiUsed, setAiUsed] = useState("NovelAI")
  const [reservationDate, setReservationDate] = useState("")
  const [reservationTime, setReservationTime] = useState("")

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
    },
    onDrop: (acceptedFiles) => {
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
        acceptedFiles.forEach((file) => {
          fileList.push(file)
        })
        const newFileList = new DataTransfer()
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
    console.log("Drag ended:", event)
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
        console.log(url)
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
      <Box
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        margin="1rem"
        w={{ base: "96px", md: "240px" }}
        h={{ base: "96px", md: "240px" }}
        overflow="hidden"
        borderRadius="md"
        position={"relative"}
      >
        <Image
          src={props.image}
          alt={`選択された画像 ${props.id + 1}`}
          w={{ base: "96px", md: "240px" }}
          h={{ base: "96px", md: "240px" }}
          objectFit="cover"
        />
        <Button
          size="sm"
          onClick={() => handleRemoveImage(props.id)}
          position="absolute"
          top="0"
          right="0"
          colorScheme="red"
          variant="ghost"
          bg="whiteAlpha.500"
          _hover={{ bg: "whiteAlpha.600" }}
        >
          ✕
        </Button>
      </Box>
    )
  }

  return (
    <>
      <Box h="100%" w="100%">
        <Stack
          alignItems={"center"}
          bg="blackAlpha.700"
          style={{ border: isHovered ? "2px dashed white" : "none" }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding={4}
            margin={4}
            background="blue.500"
            color="white"
            borderRadius="md"
            cursor="pointer"
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
          </Box>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <Flex flexWrap="wrap" justifyContent="center">
              <SortableContext
                items={selectedImages}
                strategy={verticalListSortingStrategy}
              >
                {selectedImages.map((image, index) => (
                  <SelectedImageItem
                    key={`image-${index}`}
                    image={image}
                    id={index}
                  />
                ))}
              </SortableContext>
            </Flex>
          </DndContext>
          <Stack margin={4} color="white">
            <Text fontSize="sm">JPEG、PNG、GIF、WEBP、BMP、MP4</Text>
            <Text fontSize="sm">
              1枚32MB以内、最大200枚、動画は32MB、12秒まで
            </Text>
          </Stack>
        </Stack>

        <Box maxW={1200} mx={"auto"} padding={8}>
          <Stack direction="column">
            <Text fontSize="sm">タイトル</Text>
            <Input
              id="title_input"
              minLength={1}
              maxLength={120}
              required
              type="text"
              name="title"
              placeholder="タイトル"
            />
          </Stack>

          <Stack direction="column" mt={4}>
            <Text fontSize="sm">キャプション</Text>
            <AutoResizeTextarea
              minH={8}
              maxLength={3000}
              placeholder="キャプション"
            />
          </Stack>

          <Stack direction="column" mt={4}>
            <Text fontSize="sm">年齢制限</Text>
            <RadioGroup
              onChange={handleAgeRestrictionChange}
              value={ageRestriction}
            >
              <Stack direction="column" spacing={2}>
                <Radio value="全年齢">全年齢</Radio>
                <Radio value="R-15">R-15</Radio>
                <Radio value="R-18">R-18</Radio>
                <Radio value="R-18G">R-18G</Radio>
              </Stack>
            </RadioGroup>
          </Stack>

          <Stack direction="column" mt={4}>
            <Text fontSize="sm">公開モード</Text>
            <RadioGroup onChange={handlePublicModeChange} value={publicMode}>
              <Stack direction="column" spacing={2}>
                <Radio value="全公開">全公開</Radio>
                <Radio value="限定公開(URLのみアクセス可)">
                  限定公開(URLのみアクセス可)
                </Radio>
                <Radio value="新着非表示">新着非表示</Radio>
                <Radio value="アーカイブ">アーカイブ</Radio>
                <Radio value="下書き">下書き</Radio>
              </Stack>
            </RadioGroup>
          </Stack>

          <Stack direction="column" mt={4}>
            <Text fontSize="sm">テイスト</Text>
            <Select
              onChange={(e) => handleTasteChange(e.target.value)}
              value={taste}
            >
              <option value="イラスト系">イラスト系</option>
              <option value="セミリアル系">セミリアル系</option>
              <option value="リアル系">リアル系</option>
            </Select>
          </Stack>

          <Stack direction="column" mt={4}>
            <Text fontSize="sm">使用AI</Text>
            <Select
              onChange={(e) => handleAiUsedChange(e.target.value)}
              value={aiUsed}
            >
              <option value="NovelAI">NovelAI</option>
              <option value="そのほか">そのほか</option>
            </Select>
          </Stack>

          <Stack direction="column" mt={4}>
            <Text fontSize="sm">予約投稿</Text>
            <Box display={{ base: "block", md: "flex" }}>
              <Input
                type="date"
                value={reservationDate}
                onChange={handleReservationDateChange}
                mr={{ base: 0, md: 2 }}
                mt={{ base: 2, md: 0 }}
              />
              <Input
                type="time"
                value={reservationTime}
                onChange={handleReservationTimeChange}
              />
            </Box>
          </Stack>
          {/* Submit button */}
          <Button
            margin={4}
            w="120px"
            mx={"auto"}
            type="submit"
            colorScheme="blue"
            onClick={handleUpload}
          >
            投稿
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default NewImageForm
