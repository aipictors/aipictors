"use client"
import { Button, HStack, Input } from "@chakra-ui/react"
import { useState } from "react"

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    alert(message)
    setMessage("")
  }

  return (
    <HStack>
      <Input
        placeholder="メッセージを入力してください"
        value={message}
        borderRadius={"full"}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button
        colorScheme="primary"
        borderRadius={"full"}
        lineHeight={1}
        onClick={handleSubmit}
      >
        {"送信"}
      </Button>
    </HStack>
  )
}
