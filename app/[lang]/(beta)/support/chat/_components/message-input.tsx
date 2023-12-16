"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChangeEvent, useRef, useState } from "react"
import { IoIosCloseCircle } from "react-icons/io"
import { RxUpload } from "react-icons/rx"
import TextareaAutosize from "react-textarea-autosize"

type Props = {
  isLoading: boolean
  onSubmit(message: string): void
}

export const MessageInput = (props: Props) => {
  const [message, setMessage] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleSubmit = () => {
    setSelectedImages([])
    setMessage("")
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const promises: Promise<string>[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const promise = new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target) {
              resolve(e.target.result as string)
            }
          }
          reader.readAsDataURL(file)
        })
        promises.push(promise)
      }

      try {
        const newImages = await Promise.all(promises)
        setSelectedImages((prevImages) => [...prevImages, ...newImages])
      } catch (error) {
        console.error("Error loading images:", error)
      }
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const isSendButtonEnabled = message.trim() !== "" || selectedImages.length > 0

  const handleDeleteImage = (index: number) => {
    const updatedImages = [...selectedImages]
    updatedImages.splice(index, 1)
    setSelectedImages(updatedImages)
  }

  return (
    <div className="px-4 md:pr-8 pb-4 flex gap-x-2 items-center">
      {selectedImages.map((image, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} className="relative">
          <img src={image} alt={`Selected ${index}`} />
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <IoIosCloseCircle
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer"
            onClick={() => handleDeleteImage(index)}
          />
        </div>
      ))}
      <TextareaAutosize
        autoFocus
        minRows={1}
        maxRows={3}
        aria-label="Chat input box"
        className="resize-none w-full border rounded-md p-2 h-auto"
        placeholder="メッセージを入力してください"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button onClick={handleButtonClick}>
        <div className="flex justify-center items-center">
          <RxUpload />
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
      </Button>
      {/* 送信ボタン */}
      <Button
        disabled={!isSendButtonEnabled || props.isLoading}
        onClick={handleSubmit}
      >
        {"送信"}
      </Button>
    </div>
  )
}
