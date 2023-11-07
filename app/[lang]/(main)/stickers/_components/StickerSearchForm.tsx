"use client"

import { Button, HStack, Input } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { SetStateAction } from "react"

type Props = {
  text?: string
}

const StickerSearchForm: React.FC<Props> = (props) => {
  const [searchTerm, setSearchTerm] = useState(props.text || "")
  const router = useRouter()

  const handleSearch = () => {
    if (searchTerm) {
      router.push(`/stickers/search/${encodeURIComponent(searchTerm)}`)
      return
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  const handleChange = (event: {
    target: { value: SetStateAction<string> }
  }) => {
    setSearchTerm(event.target.value)
  }

  return (
    <HStack>
      <Input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="検索キーワードを入力"
      />
      <Button onClick={handleSearch}>{"検索"}</Button>
    </HStack>
  )
}

export default StickerSearchForm
