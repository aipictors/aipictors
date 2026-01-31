import { Cpu, Search, SlidersHorizontal, User, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSearchParams, useNavigate } from "@remix-run/react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { ScrollArea } from "~/components/ui/scroll-area"
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

export function SearchHeader (props: Props) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const t = useTranslation()

  // 検索入力用 ref
  const inputRef = useRef<HTMLInputElement>(null)

  // URLパラメータから初期値を取得
  const [searchText, setSearchText] = useState(searchParams.get("q") || "")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [userSearchText, setUserSearchText] = useState("")

  // URLパラメータの変更を監視
  useEffect(() => {
    setSearchText(searchParams.get("q") || "")

    // modelパラメータがある場合は検索テキストを空にする
    if (searchParams.get("model") || searchParams.get("workModelId")) {
      setSearchText("")
    }
  }, [searchParams])

  const validateQuery = (rawText: string) => {
    const trimmedText = rawText.trim()
    const sanitizedText = trimmedText.replace(/#/g, "")
    const invalidChars = ["%", "/", "¥"]

    if (invalidChars.some((c) => sanitizedText.includes(c))) {
      toast("入力された検索文字列には使用できない文字が含まれています。")
      return null
    }
    if (trimmedText === "") {
      toast(t("検索ワードを入力してください", "Please enter a search word"))
      return null
    }
    return trimmedText
  }

  // 作品検索（主導線）
  const onSearchWorks = () => {
    const trimmedText = searchText.trim()
    const validated = validateQuery(trimmedText)
    if (validated) {
      const newParams = new URLSearchParams()
      newParams.set("q", validated)
      navigate(`/search?${newParams.toString()}`)
    }
  }

  // ユーザー検索（補助）
  const onSearchUsers = () => {
    const validated = validateQuery(userSearchText)
    if (!validated) return
    const newParams = new URLSearchParams()
    newParams.set("q", validated)
    navigate(`/users?${newParams.toString()}`)
    setIsFilterOpen(false)
  }

  const onSelectModel = (modelId: string) => {
    const newParams = new URLSearchParams()
    newParams.set("workModelId", modelId)
    navigate(`/search?${newParams.toString()}`)
    setIsFilterOpen(false)
  }

  // クリア処理
  const onClear = () => {
    setSearchText("")

    // 現在のクエリから検索系パラメータを削除
    const params = new URLSearchParams(location.search)
    params.delete("q")
    params.delete("tag")
    params.delete("model")
    params.delete("workModelId")
    params.delete("page")

    // ? が空なら取り除く
    const nextUrl = params.toString()
      ? `${location.pathname}?${params.toString()}`
      : location.pathname

    // 履歴を汚さないよう replace
    navigate(nextUrl, { replace: true })

    // 入力欄にフォーカス
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") onSearchWorks()
  }

  const getModelButtonLabel = (displayName: string) => {
    const trimmed = displayName.trim()
    if (trimmed !== "") return trimmed
    return t("モデル", "Model")
  }

  return (
    <div className="space-y-2">
      {/* 検索入力 + ボタン群（探索トップはこれが主役） */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            placeholder={t(
              "タグ・雰囲気・キャラ名で探す",
              "Search by tags, vibe, or character",
            )}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
        </div>

        <Button
          onClick={onClear}
          size="icon"
          variant="ghost"
          disabled={searchText === ""}
          aria-label={t("検索をクリア", "Clear search")}
        >
          <X className="h-4 w-4" />
        </Button>

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              aria-label={t("フィルタを開く", "Open filters")}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0" side="right">
            <ScrollArea className="h-full p-4">
              <div className="space-y-8">
                <SheetHeader>
                  <SheetTitle>{t("絞り込み条件", "Filters")}</SheetTitle>
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "見たい作品の雰囲気に近づけます（おすすめがデフォルト）",
                      "Narrow by vibe (defaults are recommended)",
                    )}
                  </p>
                </SheetHeader>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <User className="h-4 w-4" />
                    {t("ユーザー検索", "User search")}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t(
                        "ユーザー名 / ID で検索",
                        "Search by username / id",
                      )}
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSearchUsers()
                      }}
                    />
                    <Button size="icon" onClick={onSearchUsers}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Cpu className="h-4 w-4" />
                    {t("モデル一覧", "Models")}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "押すと、そのモデルで投稿された作品一覧を表示します",
                      "Tap to show works posted with that model",
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(props.models ?? []).slice(0, 12).map((model) =>
                      (() => {
                        const label = getModelButtonLabel(model.displayName)
                        return (
                          <Button
                            key={model.id}
                            type="button"
                            variant="outline"
                            className="h-auto justify-start px-3 py-2 text-left"
                            onClick={() => onSelectModel(model.workModelId)}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium text-sm">
                                {label}
                              </div>
                            </div>
                          </Button>
                        )
                      })(),
                    )}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <Button
          onClick={onSearchWorks}
          size="icon"
          variant="default"
          aria-label={t("検索", "Search")}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        {t(
          "例：魔法使い 青髪 ファンタジー（Enterで検索 / そのまま眺めてもOK）",
          "Example: wizard blue hair fantasy (Press Enter / or just browse)",
        )}
      </p>
    </div>
  )
}
