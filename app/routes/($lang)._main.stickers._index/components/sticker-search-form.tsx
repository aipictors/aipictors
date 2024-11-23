import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useNavigate } from "react-router";
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation" // 翻訳フックをインポート

type Props = {
  text?: string
}

/**
 * 検索フォーム
 */
export function StickerSearchForm(props: Props) {
  const t = useTranslation() // 翻訳フックの使用
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
          placeholder={t("検索キーワードを入力", "Enter search keywords")}
        />
        <Button onClick={handleSearch}>{t("検索", "Search")}</Button>
      </div>
      <div className="flex gap-x-2">
        <Button
          variant={"secondary"}
          onClick={() => handleQuickSearch("ありがとう")}
        >
          {t("ありがとう", "Thank you")}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => handleQuickSearch("嬉しい")}
        >
          {t("嬉しい", "Happy")}
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => handleQuickSearch("すごい")}
        >
          {t("すごい", "Amazing")}
        </Button>
      </div>
    </section>
  )
}
