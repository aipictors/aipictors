"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChangeEvent, useRef, useState } from "react"
import { RxUpload } from "react-icons/rx"
import TextareaAutosize from "react-textarea-autosize"

type Props = {
  isLoading: boolean
  onSubmit(message: string): void
}

export const MessageInput = (props: Props) => {
  const [message, setMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string>("")

  const handleSubmit = () => {
    props.onSubmit(message)
    setMessage("")
  }
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target) {
          setSelectedImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="px-4 md:pr-8 pb-4 flex gap-x-2 items-center">
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
      {/* <IconButton
        aria-label="photo"
        icon={<Icon as={TbPhoto} fontSize={"lg"} />}
        borderRadius={"full"}
      /> */}
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
      {selectedImage && (
        <div>
          <img src={selectedImage} alt="Selected" />
        </div>
      )}
      <Button
        disabled={message.length === 0 || props.isLoading}
        onClick={handleSubmit}
      >
        {"送信"}
      </Button>
    </div>
  )
}
