"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import TextareaAutosize from "react-textarea-autosize"

type Props = {
  isLoading: boolean
  onSubmit(message: string): void
}

export const MessageInput = (props: Props) => {
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    props.onSubmit(message)
    setMessage("")
  }

  return (
    <div className="px-4 md:pr-8 pb-4 flex gap-x-2">
      <div className="flex-grow">
        <TextareaAutosize
          autoFocus
          aria-label="Chat input box"
          className="resize-none w-full border rounded-md p-2 h-auto"
          placeholder="メッセージを入力してください"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      {/* <IconButton
        aria-label="photo"
        icon={<Icon as={TbPhoto} fontSize={"lg"} />}
        borderRadius={"full"}
      /> */}
      <Button
        disabled={message.length === 0 || props.isLoading}
        onClick={handleSubmit}
      >
        {"送信"}
      </Button>
    </div>
  )
}
