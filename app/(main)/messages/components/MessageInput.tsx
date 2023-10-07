"use client"
import { Button, HStack, Icon, IconButton, Input } from "@chakra-ui/react"
import { useState } from "react"
import { TbPhoto } from "react-icons/tb"

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    alert(message)
    setMessage("")
  }

  return (
    <HStack>
      <IconButton
        aria-label="photo"
        icon={<Icon as={TbPhoto} fontSize={"lg"} />}
        borderRadius={"full"}
      />
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
