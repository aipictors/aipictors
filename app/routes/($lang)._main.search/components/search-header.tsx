import type { CheckedState } from "@radix-ui/react-checkbox"
import { Search, User, X } from "lucide-react" // ← X アイコンを追加
import { useState, useEffect, useRef } from "react" // ← useRef を追加
import { useSearchParams, useNavigate } from "@remix-run/react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"

type AiModel = {
  id: string
  name: string
  displayName: string
  workModelId: string
  thumbnailImageURL?: string | null
}

type Props = {
  models?: AiModel[]
}

export function SearchHeader(_props: Props) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const t = useTranslation()

  // 検索入力用 ref
  const inputRef = useRef<HTMLInputElement>(null)

  // URLパラメータから初期値を取得
  const [searchText, setSearchText] = useState(searchParams.get("q") || "")
  const [searchType, setSearchType] = useState(
    searchParams.get("type") || "works",
  )
  const [isR18, setIsR18] = useState(searchParams.get("rating") === "R18")

  // URLパラメータの変更を監視
  useEffect(() => {
    setSearchText(searchParams.get("q") || "")
    setSearchType(searchParams.get("type") || "works")
    setIsR18(searchParams.get("rating") === "R18")

    // modelパラメータがある場合は検索テキストを空にする
    if (searchParams.get("model")) {
      setSearchText("")
    }
  }, [searchParams])

  // 検索実行
  const onSearch = () => {
    const trimmedText = searchText.trim()
    const sanitizedText = trimmedText.replace(/#/g, "")
    const invalidChars = ["%", "/", "¥"]

    if (invalidChars.some((c) => sanitizedText.includes(c))) {
      toast("入力された検索文字列には使用できない文字が含まれています。")
      return
    }

    if (trimmedText !== "") {
      const newParams = new URLSearchParams()
      newParams.set("q", trimmedText)

      if (searchType === "users") {
        navigate(`/users?${newParams.toString()}`)
      } else {
        if (isR18) newParams.set("rating", "R18")
        const path = isR18 ? "/r/search" : "/search"
        navigate(`${path}?${newParams.toString()}`)
      }
    } else {
      toast(t("検索ワードを入力してください", "Please enter a search word"))
    }
  }

  // クリア処理
  const onClear = () => {
    setSearchText("")

    // 現在のクエリから q を削除
    const params = new URLSearchParams(location.search)
    params.delete("q")

    // ? が空なら取り除く
    const nextUrl = params.toString()
      ? `${location.pathname}?${params.toString()}`
      : location.pathname

    // 履歴を汚さないよう replace
    navigate(nextUrl, { replace: true })

    // 入力欄にフォーカス
    inputRef.current?.focus()
  }

  const _handleR18Change = (checked: CheckedState) => {
    setIsR18(checked === true)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") onSearch()
  }

  return (
    <div className="space-y-4">
      {/* 検索タイプ選択 */}
      <Tabs value={searchType} onValueChange={setSearchType} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="works" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t("作品を検索", "Search Works")}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("ユーザーを検索", "Search Users")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 検索入力 + ボタン群 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef} // ← ref を渡す
            placeholder={
              searchType === "users"
                ? t("ユーザー名で検索", "Search by username")
                : t("タグ・キーワードで検索", "Search by tag or keyword")
            }
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
        </div>

        {/* クリアボタン */}
        <Button
          onClick={onClear}
          size="icon"
          variant="ghost"
          disabled={searchText === ""}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* 検索ボタン */}
        <Button onClick={onSearch} size="icon" variant="default">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* 検索のヒント */}
      <div className="mb-4 text-muted-foreground text-xs">
        {searchType === "works" ? (
          <p>
            {t(
              "タグやキーワードで作品を検索できます。複数のタグはスペースで区切ってください。",
              "You can search for works by tags or keywords. Separate multiple tags with spaces.",
            )}
          </p>
        ) : (
          <p>
            {t(
              "ユーザー名やユーザーIDで検索できます。",
              "You can search by username or user ID.",
            )}
          </p>
        )}
      </div>
    </div>
  )
}
