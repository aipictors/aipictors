"use client"

import { Button, HStack, Input } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  text?: string
}

/**
 * 検索フォーム
 * @param props
 * @returns
 */
const StickerSearchForm = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState(props.text || "")

  const router = useRouter()

  const handleSearch = () => {
    if (searchTerm) {
      router.push(`/stickers/search/${encodeURIComponent(searchTerm)}`)
      return
    }
  }

  return (
    <HStack px={4} w={"100%"}>
      <Input
        type="text"
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value)
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter") {
            handleSearch()
          }
        }}
        placeholder="検索キーワードを入力"
      />
      <Button onClick={handleSearch}>{"検索"}</Button>
    </HStack>
  )
}

export default StickerSearchForm
