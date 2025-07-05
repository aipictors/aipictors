import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Calendar } from "~/components/ui/calendar"
import { FilterIcon, CalendarIcon, XIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"

export type AiModel = {
  id: string
  name: string
  displayName?: string
}

export type FilterValues = {
  ageRestrictions: string[]
  aiUsage: string
  promptPublic: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  myWorksOnly?: boolean
  selectedModelIds?: string[]
  modelSearch?: string
}

type Props = {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  onApplyFilters: () => void
  models?: AiModel[]
  showMyWorksOnly?: boolean
}

export function CompactFilter(props: Props) {
  const { filters, onFiltersChange, onApplyFilters } = props
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslation()

  const ageRestrictions = [
    { value: "G", label: t("全年齢", "All Ages") },
    { value: "R15", label: "R-15" },
    { value: "R18", label: "R-18" },
    { value: "R18G", label: "R-18G" },
  ]

  const updateFilter = (
    key: keyof FilterValues,
    value: string | Date | undefined | string[] | boolean,
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      ageRestrictions: [],
      aiUsage: "all",
      promptPublic: "all",
      dateFrom: undefined,
      dateTo: undefined,
      myWorksOnly: false,
      selectedModelIds: [],
      modelSearch: "",
    })
  }

  const hasActiveFilters =
    filters.ageRestrictions.length > 0 ||
    filters.aiUsage !== "all" ||
    filters.promptPublic !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.myWorksOnly ||
    (filters.selectedModelIds && filters.selectedModelIds.length > 0)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative",
            hasActiveFilters && "border-primary text-primary",
          )}
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          {t("フィルタ", "Filter")}
          {hasActiveFilters && (
            <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-[80vh] overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t("フィルタ", "Filter")}</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <XIcon className="h-4 w-4" />
                  {t("クリア", "Clear")}
                </Button>
              )}
            </div>

            {/* 年齢制限 */}
            <div className="space-y-3">
              <div className="font-medium text-sm">
                {t("年齢制限", "Age Restriction")}
              </div>
              <div className="space-y-2">
                {ageRestrictions.map((age) => (
                  <div key={age.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age-${age.value}`}
                      checked={filters.ageRestrictions.includes(age.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("ageRestrictions", [
                            ...filters.ageRestrictions,
                            age.value,
                          ])
                        } else {
                          updateFilter(
                            "ageRestrictions",
                            filters.ageRestrictions.filter(
                              (item) => item !== age.value,
                            ),
                          )
                        }
                      }}
                    />
                    <label
                      htmlFor={`age-${age.value}`}
                      className="cursor-pointer text-sm"
                    >
                      {age.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* AI使用 */}
            {/* <div className="space-y-2">
              <div className="font-medium text-sm">
                {t("AI使用", "AI Usage")}
              </div>
              <Select
                value={filters.aiUsage}
                onValueChange={(value) => updateFilter("aiUsage", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("すべて", "All")}</SelectItem>
                  <SelectItem value="ai">{t("AI使用", "AI Used")}</SelectItem>
                  <SelectItem value="no-ai">
                    {t("AI未使用", "No AI")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* プロンプト公開 */}
            {/* <div className="space-y-2">
              <div className="font-medium text-sm">
                {t("プロンプト", "Prompt")}
              </div>
              <Select
                value={filters.promptPublic}
                onValueChange={(value) => updateFilter("promptPublic", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("すべて", "All")}</SelectItem>
                  <SelectItem value="public">{t("公開", "Public")}</SelectItem>
                  <SelectItem value="private">
                    {t("非公開", "Private")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* 自分の作品のみ */}
            {props.showMyWorksOnly && (
              <div className="flex items-center space-x-2">
                {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
                <Checkbox
                  id="my-works-only"
                  checked={filters.myWorksOnly || false}
                  onCheckedChange={(checked) => {
                    updateFilter("myWorksOnly", checked === true)
                  }}
                />
                <label
                  htmlFor="my-works-only"
                  className="cursor-pointer font-medium text-sm"
                >
                  {t("自分の作品のみ", "My works only")}
                </label>
              </div>
            )}

            {/* AIモデル選択 */}
            {props.models && props.models.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {t("AIモデル", "AI Model")}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t("モデル名で検索", "Search by model name")}
                      value={filters.modelSearch || ""}
                      onChange={(e) =>
                        updateFilter("modelSearch", e.target.value)
                      }
                      className="h-8 pl-8"
                    />
                    <Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {props.models
                      .filter(
                        (model) =>
                          !filters.modelSearch ||
                          model.name
                            .toLowerCase()
                            .includes(filters.modelSearch.toLowerCase()) ||
                          model.displayName
                            ?.toLowerCase()
                            .includes(filters.modelSearch.toLowerCase()),
                      )
                      .slice(0, 10)
                      .map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`model-${model.id}`}
                            checked={
                              filters.selectedModelIds?.includes(model.id) ||
                              false
                            }
                            onCheckedChange={(checked) => {
                              const currentIds = filters.selectedModelIds || []
                              if (checked) {
                                updateFilter("selectedModelIds", [
                                  ...currentIds,
                                  model.id,
                                ])
                              } else {
                                updateFilter(
                                  "selectedModelIds",
                                  currentIds.filter((id) => id !== model.id),
                                )
                              }
                            }}
                          />
                          <label
                            htmlFor={`model-${model.id}`}
                            className="cursor-pointer text-sm"
                            title={model.displayName || model.name}
                          >
                            {model.displayName || model.name}
                          </label>
                        </div>
                      ))}
                  </div>
                  {filters.selectedModelIds &&
                    filters.selectedModelIds.length > 0 && (
                      <div className="text-muted-foreground text-xs">
                        {filters.selectedModelIds.length}{" "}
                        {t("個のモデルが選択されています", "models selected")}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* 期間 */}
            <div className="space-y-2">
              <div className="font-medium text-sm">
                {t("作成期間", "Period")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {filters.dateFrom
                        ? format(filters.dateFrom, "MM/dd")
                        : t("開始", "From")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => updateFilter("dateFrom", date)}
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
                        !filters.dateTo && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {filters.dateTo
                        ? format(filters.dateTo, "MM/dd")
                        : t("終了", "To")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => updateFilter("dateTo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 適用ボタン */}
            <Button
              onClick={() => {
                onApplyFilters()
                setIsOpen(false)
              }}
              className="h-8 w-full"
              size="sm"
            >
              {t("適用", "Apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
