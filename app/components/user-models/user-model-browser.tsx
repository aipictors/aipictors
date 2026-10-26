import { Link } from "@remix-run/react"
import {
  Loader2Icon,
  PackageOpenIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useUserModelsInfinite } from "~/components/user-models/use-user-models"
import {
  UserModelCard,
  UserModelCardSkeleton,
} from "~/components/user-models/user-model-card"
import {
  USER_MODEL_BASE_MODELS,
  USER_MODEL_KINDS,
  USER_MODEL_RATINGS,
} from "~/lib/user-models/constants"
import type {
  UserModel,
  UserModelBaseModel,
  UserModelKind,
  UserModelRating,
  UserModelSort,
} from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

const skeletonKeys = Array.from(
  { length: 10 },
  (_, index) => `skeleton-${index}`,
)

export type UserModelBrowserFilters = {
  q: string
  kind: UserModelKind | null
  baseModel: UserModelBaseModel | null
  ratings: UserModelRating[]
  sort: UserModelSort
}

export const defaultUserModelBrowserFilters: UserModelBrowserFilters = {
  q: "",
  kind: null,
  baseModel: null,
  ratings: ["G", "R15"],
  sort: "popular",
}

type Props = {
  /**
   * 種類を固定する（生成画面のピッカー）
   */
  fixedKind?: UserModelKind
  initialFilters?: Partial<UserModelBrowserFilters>
  onFiltersChange?(filters: UserModelBrowserFilters): void
  onSelect?(model: UserModel): void
  selectedIds?: string[]
  /**
   * ダイアログ内などの狭い表示
   */
  compact?: boolean
}

function FilterChip(props: {
  isActive: boolean
  onClick(): void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.isActive}
      className={cn(
        "h-8 shrink-0 rounded-full border px-3 font-medium text-xs transition-colors",
        props.isActive
          ? "border-foreground bg-foreground text-background"
          : "bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {props.children}
    </button>
  )
}

/**
 * みんなのモデルの検索・フィルタ・無限スクロール一覧
 */
export function UserModelBrowser(props: Props) {
  const [filters, setFilters] = useState<UserModelBrowserFilters>({
    ...defaultUserModelBrowserFilters,
    ...props.initialFilters,
  })
  const [searchText, setSearchText] = useState(filters.q)

  const updateFilters = (patch: Partial<UserModelBrowserFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...patch }
      props.onFiltersChange?.(next)
      return next
    })
  }

  // 入力が止まってから検索する
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim() !== filters.q) {
        updateFilters({ q: searchText.trim() })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchText])

  const kind = props.fixedKind ?? filters.kind

  const query = useUserModelsInfinite({
    kind,
    q: filters.q,
    baseModel: filters.baseModel,
    ratings: filters.ratings,
    sort: filters.sort,
  })

  const models = query.data?.pages.flatMap((page) => page.models) ?? []

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sentinelRef.current
    if (!element || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage()
        }
      },
      { rootMargin: "600px 0px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [query.hasNextPage, query.isFetchingNextPage, models.length])

  const toggleRating = (rating: UserModelRating) => {
    const ratings = filters.ratings.includes(rating)
      ? filters.ratings.filter((value) => value !== rating)
      : [...filters.ratings, rating]
    updateFilters({ ratings: ratings.length === 0 ? ["G"] : ratings })
  }

  const gridClassName = props.compact
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"

  const hasActiveFilter =
    filters.q !== "" ||
    (props.fixedKind === undefined && filters.kind !== null) ||
    filters.baseModel !== null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="モデル名・タグ・作者で検索"
              className="h-10 rounded-full pr-9 pl-9"
              aria-label="モデルを検索"
            />
            {searchText !== "" && (
              <button
                type="button"
                className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchText("")}
                aria-label="検索をクリア"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              updateFilters({ sort: value as UserModelSort })
            }
          >
            <SelectTrigger
              className="h-10 w-28 rounded-full"
              aria-label="並び替え"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">人気順</SelectItem>
              <SelectItem value="new">新着順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          {props.fixedKind === undefined && (
            <>
              <FilterChip
                isActive={filters.kind === null}
                onClick={() => updateFilters({ kind: null })}
              >
                すべて
              </FilterChip>
              {USER_MODEL_KINDS.map((item) => (
                <FilterChip
                  key={item.value}
                  isActive={filters.kind === item.value}
                  onClick={() =>
                    updateFilters({
                      kind: filters.kind === item.value ? null : item.value,
                    })
                  }
                >
                  {item.label}
                </FilterChip>
              ))}
              <span className="mx-1 h-5 w-px shrink-0 bg-border" />
            </>
          )}
          {USER_MODEL_BASE_MODELS.map((item) => (
            <FilterChip
              key={item.value}
              isActive={filters.baseModel === item.value}
              onClick={() =>
                updateFilters({
                  baseModel:
                    filters.baseModel === item.value ? null : item.value,
                })
              }
            >
              {item.label}
            </FilterChip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-border" />
          {USER_MODEL_RATINGS.map((item) => (
            <FilterChip
              key={item.value}
              isActive={filters.ratings.includes(item.value)}
              onClick={() => toggleRating(item.value)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {query.isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium">モデルを読み込めませんでした</p>
          <p className="mt-1 text-muted-foreground">
            {query.error instanceof Error ? query.error.message : ""}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => query.refetch()}
          >
            再読み込み
          </Button>
        </div>
      )}

      {query.isLoading && (
        <div className={gridClassName}>
          {skeletonKeys.map((key) => (
            <UserModelCardSkeleton key={key} />
          ))}
        </div>
      )}

      {!query.isLoading && !query.isError && models.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <PackageOpenIcon className="size-10 text-muted-foreground" />
          <div>
            <p className="font-semibold">
              {hasActiveFilter
                ? "条件に合うモデルが見つかりませんでした"
                : "まだモデルがありません"}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {hasActiveFilter
                ? "キーワードやフィルタを変えてみてください"
                : "最初のモデルをアップロードしてみませんか？"}
            </p>
          </div>
          {!hasActiveFilter && (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/models/upload">
                <UploadIcon className="mr-1 size-4" />
                モデルをアップロード
              </Link>
            </Button>
          )}
        </div>
      )}

      {models.length > 0 && (
        <div className={gridClassName}>
          {models.map((model) => (
            <UserModelCard
              key={model.id}
              model={model}
              onSelect={props.onSelect}
              isSelected={props.selectedIds?.includes(model.id)}
              blurSensitive={!filters.ratings.includes("R18")}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex h-10 items-center justify-center">
        {query.isFetchingNextPage && (
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        )}
        {!query.isFetchingNextPage && query.hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => query.fetchNextPage()}
          >
            もっと見る
          </Button>
        )}
      </div>
    </div>
  )
}
