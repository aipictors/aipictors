"use client"

import { Button, HStack, Input } from "@chakra-ui/react"
import { useState } from "react"

type Props = {
  isLoading: boolean
  onSubmit(message: string): void
}

export const MessageInput: React.FC<Props> = (props) => {
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    props.onSubmit(message)
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
      {/* <IconButton
        aria-label="photo"
        icon={<Icon as={TbPhoto} fontSize={"lg"} />}
        borderRadius={"full"}
      /> */}
      <Button
        colorScheme="primary"
        borderRadius={"full"}
        lineHeight={1}
        isLoading={props.isLoading}
        onClick={handleSubmit}
      >
        {"送信"}
      </Button>
    </HStack>
  )
}
