import { useQuery } from "@apollo/client/index"
import { useState, useId, useCallback, useEffect, useContext } from "react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Calendar } from "~/components/ui/calendar"
import { FilterIcon, CalendarIcon, XIcon, Search, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { graphql } from "gql.tada"
import { useSearchParams } from "@remix-run/react"
import { AuthContext } from "~/contexts/auth-context"

export type AiModel = {
  id: string
  name: string
  displayName?: string
  workModelId: string | null
}

export type FilterValues = {
  ageRestrictions: string[]
  aiUsage: string
  promptPublic: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  myWorksOnly?: boolean
  selectedModelId?: string | undefined // 単体のモデルID
  modelSearch?: string
  workModelId?: string // 単体のworkModelId
  orderBy?: string // 並び順
  navigateToTagPage?: boolean // タグページへ遷移するかどうか
}

type Props = {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  onApplyFilters: () => void
  isLoading?: boolean
}

// モデル名キャッシュ
let cachedModels: AiModel[] | null = null

// フィルタコンテンツのコンポーネント
function FilterContent({
  inSheet = false,
  localFilters,
  updateLocalFilter,
  uniqueId,
  ageRestrictions,
  t,
  localModelSearch,
  setLocalModelSearch,
  modelsLoading,
  models,
  showAllModels,
  setShowAllModels,
  authContext,
}: {
  inSheet?: boolean
  localFilters: FilterValues
  updateLocalFilter: (
    key: keyof FilterValues,
    value: string | string[] | Date | undefined | boolean,
  ) => void
  uniqueId: string
  ageRestrictions: { value: string; label: string }[]
  t: (jaText: string, enText: string) => string
  localModelSearch: string
  setLocalModelSearch: (value: string) => void
  modelsLoading: boolean
  models: AiModel[]
  showAllModels: boolean
  setShowAllModels: (value: boolean) => void
  authContext: { isNotLoggedIn: boolean }
}) {
  // モデル検索の絞り込み
  const filteredModels = models.filter(
    (model) =>
      !localModelSearch ||
      model.name.toLowerCase().includes(localModelSearch.toLowerCase()) ||
      model.displayName?.toLowerCase().includes(localModelSearch.toLowerCase()),
  )

  // 選択されたモデル
  const selectedModel = models.find(
    (model) => model.id === localFilters.selectedModelId,
  )

  // 未選択のモデルを表示順に並べる
  const unselectedModels = filteredModels.filter(
    (model) => model.id !== localFilters.selectedModelId,
  )

  return (
    <div
      className={cn(
        "space-y-4 overflow-y-auto",
        inSheet ? "max-h-[60vh]" : "max-h-[70vh]",
      )}
    >
      {/* 年齢制限 */}
      <div className="space-y-3">
        <div className="font-medium text-sm">
          {t("年齢制限", "Age Restriction")}
        </div>
        <div className="space-y-2">
          {ageRestrictions.map((age) => (
            <div key={age.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${uniqueId}-age-${age.value}-${inSheet ? "sheet" : "dialog"}`}
                checked={localFilters.ageRestrictions.includes(age.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateLocalFilter("ageRestrictions", [
                      ...localFilters.ageRestrictions,
                      age.value,
                    ])
                  } else {
                    updateLocalFilter(
                      "ageRestrictions",
                      localFilters.ageRestrictions.filter(
                        (item) => item !== age.value,
                      ),
                    )
                  }
                }}
              />
              <label
                htmlFor={`${uniqueId}-age-${age.value}-${inSheet ? "sheet" : "dialog"}`}
                className="cursor-pointer text-sm"
              >
                {age.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* プロンプト公開 */}
      <div className="space-y-2">
        <div className="font-medium text-sm">{t("プロンプト", "Prompt")}</div>
        <Select
          value={localFilters.promptPublic}
          onValueChange={(value) => updateLocalFilter("promptPublic", value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("すべて", "All")}</SelectItem>
            <SelectItem value="public">{t("公開", "Public")}</SelectItem>
            <SelectItem value="private">{t("非公開", "Private")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 自分の作品のみ */}
      {!authContext.isNotLoggedIn && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${uniqueId}-my-works-only-${inSheet ? "sheet" : "dialog"}`}
            checked={localFilters.myWorksOnly || false}
            onCheckedChange={(checked) => {
              updateLocalFilter("myWorksOnly", checked === true)
            }}
          />
          <label
            htmlFor={`${uniqueId}-my-works-only-${inSheet ? "sheet" : "dialog"}`}
            className="cursor-pointer font-medium text-sm"
          >
            {t("自分の作品のみ", "My works only")}
          </label>
        </div>
      )}

      {/* AIモデル選択 */}
      <div className="space-y-2">
        <div className="font-medium text-sm">{t("AIモデル", "AI Model")}</div>
        <div className="space-y-2">
          {/* モデル検索 */}
          <div className="relative">
            <Input
              type="text"
              placeholder={t("モデル名で検索", "Search by model name")}
              value={localModelSearch}
              onChange={(e) => setLocalModelSearch(e.target.value)}
              className="h-8 pl-8"
            />
            <Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-gray-400" />
          </div>

          {/* ローディング表示 */}
          {modelsLoading && (
            <div className="text-muted-foreground text-sm">
              {t("モデルを読み込み中...", "Loading models...")}
            </div>
          )}

          {/* モデル一覧 */}
          {!modelsLoading && (
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {/* 選択されたモデルを先頭に表示 */}
              {selectedModel && (
                <div className="flex items-center space-x-2 rounded bg-blue-50 p-1">
                  <Checkbox
                    id={`${uniqueId}-model-${selectedModel.id}-${inSheet ? "sheet" : "dialog"}`}
                    checked={true}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        updateLocalFilter("selectedModelId", undefined)
                      }
                    }}
                  />
                  <label
                    htmlFor={`${uniqueId}-model-${selectedModel.id}-${inSheet ? "sheet" : "dialog"}`}
                    className="cursor-pointer font-medium text-sm"
                    title={selectedModel.displayName || selectedModel.name}
                  >
                    {selectedModel.displayName || selectedModel.name}
                  </label>
                </div>
              )}

              {/* 未選択のモデル */}
              {unselectedModels
                .slice(0, showAllModels ? unselectedModels.length : 15)
                .map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center space-x-2 p-1"
                  >
                    <Checkbox
                      id={`${uniqueId}-model-${model.id}-${inSheet ? "sheet" : "dialog"}`}
                      checked={false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateLocalFilter("selectedModelId", model.id)
                        }
                      }}
                    />
                    <label
                      htmlFor={`${uniqueId}-model-${model.id}-${inSheet ? "sheet" : "dialog"}`}
                      className="cursor-pointer text-sm"
                      title={model.displayName || model.name}
                    >
                      {model.displayName || model.name}
                    </label>
                  </div>
                ))}

              {/* もっと見る/折りたたむボタン */}
              {unselectedModels.length > 15 && (
                <div className="p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllModels(!showAllModels)}
                    className="h-6 w-full text-xs"
                  >
                    {showAllModels ? (
                      <>
                        {t("折りたたむ", "Show Less")}
                        <span className="ml-2">↑</span>
                      </>
                    ) : (
                      <>
                        {t("もっと見る", "Show More")} (
                        {unselectedModels.length - 15}
                        {t("件", " more")})<span className="ml-2">↓</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* 検索結果がない場合 */}
              {filteredModels.length === 0 && localModelSearch && (
                <div className="p-1 text-muted-foreground text-sm">
                  {t("該当するモデルがありません", "No matching models found")}
                </div>
              )}
            </div>
          )}

          {/* 選択されたモデルの表示 */}
          {selectedModel && (
            <div className="text-muted-foreground text-xs">
              {t("選択中", "Selected")}:{" "}
              {selectedModel.displayName || selectedModel.name}
            </div>
          )}
        </div>
      </div>

      {/* 期間 */}
      <div className="space-y-2">
        <div className="font-medium text-sm">{t("作成期間", "Period")}</div>
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 justify-start text-left font-normal",
                  !localFilters.dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {localFilters.dateFrom
                  ? format(localFilters.dateFrom, "MM/dd")
                  : t("開始", "From")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.dateFrom}
                onSelect={(date) => updateLocalFilter("dateFrom", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 justify-start text-left font-normal",
                  !localFilters.dateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {localFilters.dateTo
                  ? format(localFilters.dateTo, "MM/dd")
                  : t("終了", "To")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.dateTo}
                onSelect={(date) => updateLocalFilter("dateTo", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export function CompactFilter(props: Props) {
  const { filters, onFiltersChange, onApplyFilters, isLoading = false } = props
  const authContext = useContext(AuthContext)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [localModelSearch, setLocalModelSearch] = useState("")
  const [showAllModels, setShowAllModels] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // URLパラメータからフィルタ条件を初期化
  useEffect(() => {
    const urlFilters: FilterValues = {
      ageRestrictions: searchParams.get("ageRestrictions")?.split(",") || [],
      aiUsage: searchParams.get("aiUsage") || "all",
      promptPublic: searchParams.get("promptPublic") || "all",
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom") as string)
        : undefined,
      dateTo: searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo") as string)
        : undefined,
      myWorksOnly:
        searchParams.get("myWorksOnly") === "true" &&
        !authContext.isNotLoggedIn,
      modelSearch: searchParams.get("modelSearch") || "",
      workModelId: searchParams.get("workModelId") || undefined,
      orderBy: searchParams.get("orderBy") || "LIKES_COUNT",
    }

    // URLパラメータの値が現在のフィルタと異なる場合のみ更新
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      onFiltersChange(urlFilters)
    }
  }, [authContext.isNotLoggedIn])

  // フィルタ条件をURLパラメータに保存
  const updateUrlParams = useCallback(
    (newFilters: FilterValues) => {
      const newParams = new URLSearchParams(searchParams)

      // フィルタ条件をURLパラメータに設定
      if (newFilters.ageRestrictions.length > 0) {
        newParams.set("ageRestrictions", newFilters.ageRestrictions.join(","))
      } else {
        newParams.delete("ageRestrictions")
      }

      if (newFilters.aiUsage !== "all") {
        newParams.set("aiUsage", newFilters.aiUsage)
      } else {
        newParams.delete("aiUsage")
      }

      if (newFilters.promptPublic !== "all") {
        newParams.set("promptPublic", newFilters.promptPublic)
      } else {
        newParams.delete("promptPublic")
      }

      if (newFilters.dateFrom) {
        newParams.set(
          "dateFrom",
          newFilters.dateFrom.toISOString().split("T")[0],
        )
      } else {
        newParams.delete("dateFrom")
      }

      if (newFilters.dateTo) {
        newParams.set("dateTo", newFilters.dateTo.toISOString().split("T")[0])
      } else {
        newParams.delete("dateTo")
      }

      if (newFilters.myWorksOnly && !authContext.isNotLoggedIn) {
        newParams.set("myWorksOnly", "true")
      } else {
        newParams.delete("myWorksOnly")
      }

      if (newFilters.modelSearch) {
        newParams.set("modelSearch", newFilters.modelSearch)
      } else {
        newParams.delete("modelSearch")
      }

      if (newFilters.workModelId) {
        newParams.set("workModelId", newFilters.workModelId)
      } else {
        newParams.delete("workModelId")
      }

      if (newFilters.orderBy && newFilters.orderBy !== "LIKES_COUNT") {
        newParams.set("orderBy", newFilters.orderBy)
      } else {
        newParams.delete("orderBy")
      }

      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // ローカル状態でフィルタを管理（適用ボタンが押されるまで親に反映しない）
  const [localFilters, setLocalFilters] = useState<FilterValues>(() => ({
    ...filters,
    selectedModelId: undefined,
  }))

  const uniqueId = useId()
  const t = useTranslation()

  // モデル一覧を取得
  const { data: modelsData, loading: modelsLoading } = useQuery(AiModelsQuery, {
    skip: cachedModels !== null,
    onCompleted: (data) => {
      if (data.aiModels) {
        cachedModels = data.aiModels.map((model) => ({
          id: model.id,
          name: model.name,
          displayName: model.name,
          workModelId: model.workModelId,
        }))
      }
    },
  })

  // 現在のモデル一覧を取得
  const models =
    cachedModels ||
    modelsData?.aiModels?.map((model) => ({
      id: model.id,
      name: model.name,
      displayName: model.name,
      workModelId: model.workModelId,
    })) ||
    []

  // フィルタの初期化関数
  const initializeLocalFilters = useCallback(() => {
    const initialized: FilterValues = {
      ...filters,
      selectedModelId: undefined,
      myWorksOnly: authContext.isNotLoggedIn ? false : filters.myWorksOnly,
    }

    // workModelIdから選択されたモデルIDを復元
    if (filters.workModelId && models.length > 0) {
      const selectedModel = models.find(
        (model) => model.workModelId === filters.workModelId,
      )
      if (selectedModel) {
        initialized.selectedModelId = selectedModel.id
      }
    }

    return initialized
  }, [filters, models, authContext.isNotLoggedIn])

  // PC版モーダルが開かれた時の処理
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (open) {
      const initializedFilters = initializeLocalFilters()
      setLocalFilters(initializedFilters)
    }
  }

  // スマホ版シートが開かれた時の処理
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (open) {
      const initializedFilters = initializeLocalFilters()
      setLocalFilters(initializedFilters)
    }
  }

  // ローカルフィルタを更新する関数
  const updateLocalFilter = (
    key: keyof FilterValues,
    value: string | string[] | Date | undefined | boolean,
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  // 適用ボタンが押された時の処理
  const handleApplyFilters = () => {
    // 選択されたモデルのworkModelIdを取得
    const selectedWorkModelId = localFilters.selectedModelId
      ? models.find((model) => model.id === localFilters.selectedModelId)
          ?.workModelId
      : undefined

    const updatedFilters = {
      ...localFilters,
      workModelId: selectedWorkModelId ?? undefined,
    }

    // URLパラメータを更新
    updateUrlParams(updatedFilters)

    console.log(
      "Applying filters with workModelId:",
      updatedFilters.workModelId,
    )
    onFiltersChange(updatedFilters)
    onApplyFilters()
    setIsDialogOpen(false)
    setIsSheetOpen(false)
  }

  const ageRestrictions = [
    { value: "G", label: t("全年齢", "All Ages") },
    { value: "R15", label: "R-15" },
    { value: "R18", label: "R-18" },
    { value: "R18G", label: "R-18G" },
  ]

  const clearLocalFilters = () => {
    const clearedFilters = {
      ageRestrictions: [],
      aiUsage: "all",
      promptPublic: "all",
      dateFrom: undefined,
      dateTo: undefined,
      myWorksOnly: false,
      selectedModelId: undefined,
      modelSearch: "",
      workModelId: undefined,
      orderBy: "LIKES_COUNT",
    }
    setLocalFilters(clearedFilters)
    setLocalModelSearch("")
  }

  const hasActiveFilters =
    filters.ageRestrictions.length > 0 ||
    filters.promptPublic !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.myWorksOnly ||
    filters.workModelId ||
    (filters.orderBy && filters.orderBy !== "LIKES_COUNT")

  const hasLocalActiveFilters =
    localFilters.ageRestrictions.length > 0 ||
    localFilters.aiUsage !== "all" ||
    localFilters.promptPublic !== "all" ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.myWorksOnly ||
    localFilters.selectedModelId ||
    (localFilters.orderBy && localFilters.orderBy !== "LIKES_COUNT")

  return (
    <div className="flex items-center gap-2">
      {/* PC版フィルタボタン（ダイアログ表示） */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative hidden md:flex",
              hasActiveFilters && "border-primary text-primary",
            )}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilterIcon className="mr-2 h-4 w-4" />
            )}
            {t("フィルタ", "Filter")}
            {hasActiveFilters && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {t("フィルタ", "Filter")}
              {hasLocalActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearLocalFilters}
                >
                  <XIcon className="h-4 w-4" />
                  {t("クリア", "Clear")}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <FilterContent
            inSheet={false}
            localFilters={localFilters}
            updateLocalFilter={updateLocalFilter}
            uniqueId={uniqueId}
            ageRestrictions={ageRestrictions}
            t={t}
            localModelSearch={localModelSearch}
            setLocalModelSearch={setLocalModelSearch}
            modelsLoading={modelsLoading}
            models={models}
            showAllModels={showAllModels}
            setShowAllModels={setShowAllModels}
            authContext={authContext}
          />

          {/* 適用ボタン */}
          <div className="pt-4">
            <Button
              type="button"
              onClick={handleApplyFilters}
              className="h-8 w-full"
              size="sm"
            >
              {t("適用", "Apply")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* スマホ版フィルタボタン（シート表示） */}
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative flex md:hidden",
              hasActiveFilters && "border-primary text-primary",
            )}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilterIcon className="mr-2 h-4 w-4" />
            )}
            {t("フィルタ", "Filter")}
            {hasActiveFilters && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              {t("フィルタ", "Filter")}
              {hasLocalActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearLocalFilters}
                >
                  <XIcon className="h-4 w-4" />
                  {t("クリア", "Clear")}
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            <FilterContent
              inSheet={true}
              localFilters={localFilters}
              updateLocalFilter={updateLocalFilter}
              uniqueId={uniqueId}
              ageRestrictions={ageRestrictions}
              t={t}
              localModelSearch={localModelSearch}
              setLocalModelSearch={setLocalModelSearch}
              modelsLoading={modelsLoading}
              models={models}
              showAllModels={showAllModels}
              setShowAllModels={setShowAllModels}
              authContext={authContext}
            />
          </div>

          {/* 適用ボタン */}
          <div className="sticky bottom-0 bg-background pt-4 pb-4">
            <Button
              type="button"
              onClick={handleApplyFilters}
              className="h-10 w-full"
              size="sm"
            >
              {t("適用", "Apply")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

const ImageFormAiModelFragment = graphql(
  `fragment PostImageFormAiModel on AiModelNode @_unmask {
    id
    name
    type
    workModelId
    workModelId
    thumbnailImageURL
  }`,
)

const AiModelsQuery = graphql(
  `query AiModelsQuery {
    aiModels(offset: 0, limit: 500, where: {}) {
      id
      ...PostImageFormAiModel
    }
  }`,
  [ImageFormAiModelFragment],
)
