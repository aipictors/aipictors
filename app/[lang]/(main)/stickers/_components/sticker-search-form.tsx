"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
export const StickerSearchForm = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState(props.text || "")

  const router = useRouter()

  const handleSearch = () => {
    if (searchTerm) {
      router.push(`/stickers/search/${encodeURIComponent(searchTerm)}`)
      return
    }
  }

  return (
    <div className="flex px-4 w-full">
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
    </div>
  )
}
