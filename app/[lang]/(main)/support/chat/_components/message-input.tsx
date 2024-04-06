"use client"

import { Button } from "@/_components/ui/button"
import { Textarea } from "@/_components/ui/textarea"
import { Send } from "lucide-react"
import { useState } from "react"
import { IoIosCloseCircle } from "react-icons/io"

type Props = {
  isLoading: boolean
  onSubmit(message: string): void
}

export const MessageInput = (props: Props) => {
  const [message, setMessage] = useState("")

  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleSubmit = () => {
    props.onSubmit(message)
    setSelectedImages([])
    setMessage("")
  }

  // const fileInputRef = useRef<HTMLInputElement | null>(null)

  // const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files
  //   if (files && files.length > 0) {
  //     const promises: Promise<string>[] = []

  //     for (let i = 0; i < files.length; i++) {
  //       const file = files[i]
  //       const promise = new Promise<string>((resolve) => {
  //         const reader = new FileReader()
  //         reader.onload = (e) => {
  //           if (e.target) {
  //             resolve(e.target.result as string)
  //           }
  //         }
  //         reader.readAsDataURL(file)
  //       })
  //       promises.push(promise)
  //     }

  //     try {
  //       const newImages = await Promise.all(promises)
  //       setSelectedImages((prevImages) => [...prevImages, ...newImages])
  //     } catch (error) {
  //       console.error("Error loading images:", error)
  //     }
  //   }
  // }

  // const handleButtonClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click()
  //   }
  // }

  const isSendButtonEnabled = message.trim() !== "" || selectedImages.length > 0

  const handleDeleteImage = (index: number) => {
    const updatedImages = [...selectedImages]
    updatedImages.splice(index, 1)
    setSelectedImages(updatedImages)
  }

  return (
    <div className="flex w-full items-end gap-x-4 pb-4 pb-sm md:pb-md">
      {selectedImages.map((image, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} className="relative">
          <img src={image} alt={`Selected ${index}`} />
          <IoIosCloseCircle
            className="absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center"
            onClick={() => handleDeleteImage(index)}
          />
        </div>
      ))}
      <Textarea
        className="h-auto resize-none rounded-md border p-2"
        placeholder="メッセージを入力してください"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      {/* まだアップロード処理が終えていないので、disabled */}
      {/* <Button disabled onClick={handleButtonClick} size={"icon"}>
        <div className="flex justify-center items-center">
          <ArrowUpFromLine />
          <Input
            ref={fileInputRef}
            className="hidden"
            id="imageUpload"
            type="file"
            multiple={true}
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </Button> */}
      {/* 送信ボタン */}
      <div>
        <Button
          disabled={!isSendButtonEnabled || props.isLoading}
          onClick={handleSubmit}
          size={"icon"}
        >
          <Send className="w-4" />
        </Button>
      </div>
    </div>
  )
}
