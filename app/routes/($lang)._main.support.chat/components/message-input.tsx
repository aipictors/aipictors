import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { RiCloseCircleLine } from "@remixicon/react"
import { Send } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isLoading: boolean
  onSubmit(message: string): void
}

export function MessageInput (props: Props) {
  const [message, setMessage] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const t = useTranslation()

  const handleSubmit = () => {
    props.onSubmit(message)
    setSelectedImages([])
    setMessage("")
  }

  const isSendButtonEnabled = message.trim() !== "" || selectedImages.length > 0

  const handleDeleteImage = (index: number) => {
    const updatedImages = [...selectedImages]
    updatedImages.splice(index, 1)
    setSelectedImages(updatedImages)
  }

  return (
    <div className="flex w-full items-end gap-x-4 pb-4 pb-sm md:pb-md">
      {selectedImages.map((image, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
        <div key={index} className="relative">
          <img src={image} alt={`Selected ${index}`} />
          <RiCloseCircleLine
            className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center"
            onClick={() => handleDeleteImage(index)}
          />
        </div>
      ))}
      <Textarea
        className="h-auto resize-none rounded-md border p-2"
        placeholder={t(
          "メッセージを入力してください",
          "Please enter a message",
        )}
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
