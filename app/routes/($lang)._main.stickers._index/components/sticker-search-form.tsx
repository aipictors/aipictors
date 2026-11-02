import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Link, useNavigate } from "@remix-run/react"
import { SearchIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation" // 翻訳フックをインポート

type Props = {
  text?: string
}

const QUICK_SEARCH_TERMS = [
  { ja: "ありがとう", en: "Thank you" },
  { ja: "嬉しい", en: "Happy" },
  { ja: "すごい", en: "Amazing" },
  { ja: "かわいい", en: "Cute" },
  { ja: "いいね", en: "Nice" },
  { ja: "お疲れ様", en: "Good job" },
]

/**
 * 検索フォーム
 */
export function StickerSearchForm (props: Props) {
  const t = useTranslation() // 翻訳フックの使用
  const [searchTerm, setSearchTerm] = useState(props.text || "")

  const navigate = useNavigate()

  return (
    <section className="flex w-full flex-col gap-2.5">
      <form
        role="search"
        className="flex w-full gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (searchTerm.trim()) {
            navigate(`/stickers/search/${encodeURIComponent(searchTerm.trim())}`)
          }
        }}
      >
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("スタンプを検索", "Search stickers")}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
            }}
            placeholder={t("スタンプを検索", "Search stickers")}
            className="h-10 rounded-full pl-10"
          />
        </div>
        <Button type="submit" className="h-10 shrink-0 rounded-full px-5">
          {t("検索", "Search")}
        </Button>
      </form>
      <div className="-mx-2 flex gap-1.5 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
        {QUICK_SEARCH_TERMS.map((term) => (
          <Link
            key={term.ja}
            to={`/stickers/search/${encodeURIComponent(term.ja)}`}
            className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs transition-colors hover:bg-muted/70"
          >
            {t(term.ja, term.en)}
          </Link>
        ))}
      </div>
    </section>
  )
}
