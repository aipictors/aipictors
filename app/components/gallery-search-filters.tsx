import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { Badge } from "~/components/ui/badge"
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, useLocation } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

type WorkType = "ALL" | "WORK" | "VIDEO" | "NOVEL" | "COLUMN"
type SortType =
  | "DATE_CREATED"
  | "LIKES_COUNT"
  | "VIEWS_COUNT"
  | "COMMENTS_COUNT"
type RatingType = "G" | "R15" | "R18" | "R18G"

/**
 * ギャラリー検索フィルター
 */
export function GallerySearchFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const t = useTranslation()

  // フィルター状態
  const [searchText, setSearchText] = useState("")
  const [promptText, setPromptText] = useState("")
  const [workType, setWorkType] = useState<WorkType>("ALL")
  const [sortType, setSortType] = useState<SortType>("DATE_CREATED")
  const [ratings, setRatings] = useState<RatingType[]>(["G"])
  const [hasPrompt, setHasPrompt] = useState(false)

  // URLパラメータから初期値を設定
  useEffect(() => {
    setSearchText(searchParams.get("q") || "")
    setPromptText(searchParams.get("prompt") || "")
    setWorkType((searchParams.get("workType") as WorkType) || "ALL")
    setSortType((searchParams.get("sort") as SortType) || "DATE_CREATED")

    const ratingsParam = searchParams.get("ratings")
    if (ratingsParam) {
      setRatings(ratingsParam.split(",") as RatingType[])
    } else {
      setRatings(["G"])
    }

    setHasPrompt(searchParams.get("hasPrompt") === "true")
  }, [searchParams])

  const handleRatingChange = (rating: RatingType, checked: boolean) => {
    if (checked) {
      setRatings((prev) => [...prev, rating])
    } else {
      setRatings((prev) => prev.filter((r) => r !== rating))
    }
  }

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams()

    if (searchText.trim()) {
      newSearchParams.set("q", searchText.trim())
    }

    if (promptText.trim()) {
      newSearchParams.set("prompt", promptText.trim())
    }

    if (workType !== "ALL") {
      newSearchParams.set("workType", workType)
    }

    if (sortType !== "DATE_CREATED") {
      newSearchParams.set("sort", sortType)
    }

    if (ratings.length > 0 && !(ratings.length === 1 && ratings[0] === "G")) {
      newSearchParams.set("ratings", ratings.join(","))
    }

    if (hasPrompt) {
      newSearchParams.set("hasPrompt", "true")
    }

    navigate(`${location.pathname}?${newSearchParams.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setSearchText("")
    setPromptText("")
    setWorkType("ALL")
    setSortType("DATE_CREATED")
    setRatings(["G"])
    setHasPrompt(false)
    navigate(location.pathname)
  }

  // アクティブなフィルター数を計算
  const activeFiltersCount = [
    promptText.trim() !== "",
    workType !== "ALL",
    sortType !== "DATE_CREATED",
    !(ratings.length === 1 && ratings[0] === "G"),
    hasPrompt,
  ].filter(Boolean).length

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between py-4 hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Filter className="size-4" />
                <span>{t("詳細検索", "Advanced Search")}</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pb-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* 基本検索 */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">
                  {t("基本検索", "Basic Search")}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="search-text">
                    {t("作品検索", "Search Works")}
                  </Label>
                  <Input
                    id="search-text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={t(
                      "タイトル、タグ、説明文で検索",
                      "Search by title, tags, description",
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt-text">
                    {t("プロンプト検索", "Prompt Search")}
                  </Label>
                  <Input
                    id="prompt-text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={t("プロンプトで検索", "Search by prompt")}
                  />
                </div>
              </div>

              {/* 作品設定 */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">
                  {t("作品設定", "Work Settings")}
                </h3>

                <div className="space-y-2">
                  <Label>{t("作品種別", "Work Type")}</Label>
                  <Select
                    value={workType}
                    onValueChange={(value) => setWorkType(value as WorkType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("すべて", "All")}</SelectItem>
                      <SelectItem value="WORK">
                        {t("イラスト", "Illustration")}
                      </SelectItem>
                      <SelectItem value="VIDEO">
                        {t("動画", "Video")}
                      </SelectItem>
                      <SelectItem value="NOVEL">
                        {t("小説", "Novel")}
                      </SelectItem>
                      <SelectItem value="COLUMN">
                        {t("コラム", "Column")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("並び順", "Sort Order")}</Label>
                  <Select
                    value={sortType}
                    onValueChange={(value) => setSortType(value as SortType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DATE_CREATED">
                        {t("投稿日時", "Post Date")}
                      </SelectItem>
                      <SelectItem value="LIKES_COUNT">
                        {t("いいね数", "Likes")}
                      </SelectItem>
                      <SelectItem value="VIEWS_COUNT">
                        {t("閲覧数", "Views")}
                      </SelectItem>
                      <SelectItem value="COMMENTS_COUNT">
                        {t("コメント数", "Comments")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>{t("対象年齢", "Age Rating")}</Label>
                  <div className="space-y-2">
                    {[
                      { value: "G" as const, label: t("全年齢", "All Ages") },
                      { value: "R15" as const, label: "R-15" },
                      { value: "R18" as const, label: "R-18" },
                      { value: "R18G" as const, label: "R-18G" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${value}`}
                          checked={ratings.includes(value)}
                          onCheckedChange={(checked) =>
                            handleRatingChange(value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`rating-${value}`} className="text-sm">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 詳細オプション */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm">
                  {t("詳細オプション", "Advanced Options")}
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      id: "hasPrompt",
                      checked: hasPrompt,
                      onChange: setHasPrompt,
                      label: t("プロンプトあり", "Has Prompt"),
                    },
                  ].map(({ id, checked, onChange, label }) => (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          onChange(checked === true)
                        }
                      />
                      <Label htmlFor={id} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* アクション */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="size-4" />
                {t("クリア", "Clear")}
              </Button>

              <Button onClick={applyFilters}>{t("検索", "Search")}</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
