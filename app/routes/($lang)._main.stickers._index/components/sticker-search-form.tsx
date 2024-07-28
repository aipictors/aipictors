import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useNavigate } from "@remix-run/react"
import { useState } from "react"

type Props = {
  text?: string
}

/**
 * 検索フォーム
 */
export const StickerSearchForm = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState(props.text || "")

  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchTerm) {
      navigate(`/stickers/search/${encodeURIComponent(searchTerm)}`)
      return
    }
  }

  return (
    <section className="flex w-full gap-x-4">
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
    </section>
  )
}
