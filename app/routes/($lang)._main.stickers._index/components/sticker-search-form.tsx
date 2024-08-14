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
export function StickerSearchForm(props: Props) {
  const [searchTerm, setSearchTerm] = useState(props.text || "")

  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchTerm) {
      navigate(`/stickers/search/${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term)
    navigate(`/stickers/search/${encodeURIComponent(term)}`)
  }

  return (
    <section className="flex w-full flex-col gap-y-4">
      <div className="flex w-full gap-x-4">
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
      <div className="flex gap-x-2">
        <Button
          variant={"secondary"}
          onClick={() => handleQuickSearch("ありがとう")}
        >
          {"ありがとう"}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => handleQuickSearch("嬉しい")}
        >
          {"嬉しい"}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => handleQuickSearch("すごい")}
        >
          {"すごい"}
        </Button>
      </div>
    </section>
  )
}
