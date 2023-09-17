"use client"
import {
  Box,
  Text,
  Stack,
  Textarea,
  Button,
  Input,
  Image,
  Flex,
} from "@chakra-ui/react"
import { Metadata } from "next"
import { useState } from "react"
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd"
import { useDropzone } from "react-dropzone"

const NewImagePage = () => {
  const [selectedImages, setSelectedImages] = useState([]) // 画像の配列を保持する状態
  const [isHovered, setIsHovered] = useState(false) // ホバー状態を管理

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/jpeg": [".jpeg", ".jpg"], "image/png": [".png"] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          const imageDataURL = event.target.result
          if (imageDataURL) {
            setSelectedImages([...selectedImages, imageDataURL as never]) // 新しい画像を配列に追加
          }
        }
      }
      reader.readAsDataURL(file)
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

  // 画像の並び替え処理
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(selectedImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedImages(items)
  }

  return (
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="image-list" direction="horizontal">
            {(provided) => (
              <Flex flexWrap="wrap" justifyContent="center">
                {selectedImages.map((image, index) => (
                  <Box
                    key={index}
                    margin="1rem"
                    maxW="200px" // 画像の最大幅を指定
                    overflow="hidden"
                    borderRadius="md"
                  >
                    <Image
                      src={image}
                      alt={`選択された画像 ${index + 1}`}
                      w="100%"
                      h="auto"
                      ref={provided.innerRef}
                      objectFit="cover" // アスペクト比を保持し、余白をカット
                    />
                  </Box>
                ))}
              </Flex>
            )}
          </Droppable>
        </DragDropContext>

        <Stack margin={4} color="white">
          <Text fontSize="sm">JPEG、PNG、GIF、WEBP、BMP、MP4</Text>
          <Text fontSize="sm">
            1枚32MB以内、最大200枚、動画は32MB、12秒まで
          </Text>
        </Stack>
      </Stack>

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

      <Stack direction="column">
        <Text fontSize="sm">キャプション</Text>
        <Textarea
          id="caption_input"
          maxLength={3000}
          name="explanation"
          placeholder="キャプション"
        />
      </Stack>

      {/* Submit button */}
      <Button margin={4} w="120px" mx={"auto"} type="submit" colorScheme="blue">
        投稿
      </Button>
    </Box>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NewImagePage
