import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { cn } from "~/lib/utils"
import { removeDuplicates } from "~/utils/remove-duplicates"
import { ConfigModelButton } from "~/routes/($lang).generation._index/components/config-view/config-model-button"
import { ImageModelCard } from "~/routes/($lang).generation._index/components/config-view/image-model-card"
import type { ImageModelContextFragment } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { toCategoryName } from "~/routes/($lang).generation._index/utils/to-category-name"
import type { FragmentOf } from "gql.tada"
import { StarIcon, InfoIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card"

type Props = {
  models: FragmentOf<typeof ImageModelContextFragment>[]
  selectedModelId: string | null
  favoritedModelIds: number[]
  isInitFavorited: boolean
  onChangeFavoritedModel(modelId: number, rating: number): void
  onSelect(id: string, type: string, prompt: string): void
  onSearchClick(id: string, name: string): void
}

export function ImageModelsList(props: Props) {
  const t = useTranslation()
  const [selectedType, selectType] = useState("ALL")
  const [selectedCategory, selectCategory] = useState("ALL")
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [showFavoriteModels, setShowFavoriteModels] = useState(
    props.isInitFavorited,
  )
  const [showNewModels, setShowNewModels] = useState(false)
  const [searchText, setSearchText] = useState("") // 検索テキストのステートを追加

  const modelTypes = removeDuplicates(props.models.map((m) => m.type))
  const modelCategories = removeDuplicates(
    props.models.map((m) => m.category),
  ).sort((a, b) => {
    const categoryOrder: { [key: string]: number } = {
      UNIVERSAL: 0,
      ILLUSTRATION_GIRL: 1,
      BIKINI_MODEL: 2,
      ANIMAL: 999,
      ANIME_GIRL: 999,
      BACKGROUND: 999,
      FIGURE: 999,
      ILLUSTRATION_BOY: 999,
    }
    const orderA = Object.prototype.hasOwnProperty.call(categoryOrder, a)
      ? categoryOrder[a]
      : 999
    const orderB = Object.prototype.hasOwnProperty.call(categoryOrder, b)
      ? categoryOrder[b]
      : 999
    if (orderA !== orderB) {
      return orderA - orderB
    }
    return a.localeCompare(b)
  })

  const activeCategories =
    selectedCategory === "ALL" ? modelCategories : [selectedCategory]

  const isFavorited = (modelId: number) => {
    return props.favoritedModelIds.includes(modelId)
  }

  const filterModels = () => {
    const universalModels = props.models.filter(
      (model) => model.category === "UNIVERSAL",
    )
    const otherModels = props.models.filter(
      (model) => model.category !== "UNIVERSAL",
    )

    return [...universalModels, ...otherModels]
      .filter((model) => {
        return showFavoriteModels ? isFavorited(Number(model.id)) : true
      })
      .filter((model) => {
        return selectedCategory === "ALL" || model.category === selectedCategory
      })
      .filter((model) => {
        return selectedType === "ALL" || model.type === selectedType
      })
      .filter((model) => {
        return showNewModels ? model.isNew : true
      })
      .filter((model) => {
        // 検索テキストが空の場合は全てのモデルを表示
        if (!searchText) return true
        // モデル名に検索テキストが含まれる場合のみ表示（大文字小文字を無視）
        return model.displayName
          .toLowerCase()
          .includes(searchText.toLowerCase())
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }

  const categorySections = activeCategories.map((category) => {
    const models = filterModels().filter((m) => m.category === category)
    if (models.length === 0) return null
    return { category, models }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-y-2">
        <div className="flex gap-x-2">
          <Select
            onOpenChange={() => {
              if (isSelectorOpen) {
                setTimeout(() => {
                  setIsSelectorOpen(!isSelectorOpen)
                }, 100)
              } else {
                setIsSelectorOpen(!isSelectorOpen)
              }
            }}
            onValueChange={selectCategory}
          >
            <SelectTrigger className="w-32 sm:w-40">
              <SelectValue placeholder={t("カテゴリ", "Category")} />
            </SelectTrigger>
            <SelectContent>
              {["ALL", ...modelCategories].map((category) => (
                <SelectItem key={category} value={category}>
                  {toCategoryName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onOpenChange={() => {
              if (isSelectorOpen) {
                setTimeout(() => {
                  setIsSelectorOpen(!isSelectorOpen)
                }, 100)
              } else {
                setIsSelectorOpen(!isSelectorOpen)
              }
            }}
            onValueChange={selectType}
          >
            <SelectTrigger className="w-32 sm:w-40">
              <SelectValue placeholder={t("種別", "Type")} />
            </SelectTrigger>
            <SelectContent>
              {["ALL", ...modelTypes].map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "ALL" ? t("全て", "All") : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setShowFavoriteModels((prev) => !prev)
            }}
            aria-label={t("お気に入り", "Favorites")}
            size={"icon"}
            variant="ghost"
          >
            <StarIcon
              className={cn(showFavoriteModels ? "fill-yellow-500" : "")}
            />
          </Button>
          <Button
            onClick={() => {
              setShowNewModels((prev) => !prev)
            }}
            aria-label={t("新着", "New")}
            size={"icon"}
            variant="secondary"
          >
            <span
              className={cn(
                "font-bold text-sm",
                showNewModels ? "text-blue-500" : "",
              )}
            >
              {"New"}
            </span>
          </Button>
        </div>
        <Input
          placeholder={t("モデル名で検索", "Search by model name")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
        />
      </div>
      <ScrollArea className="-mx-4 max-h-[50vh] min-h-[50vh] overflow-auto">
        <div className="space-y-4">
          {removeDuplicates(categorySections).map((item) => (
            <div key={item.category} className="space-y-2 px-4">
              <p className="font-bold">{toCategoryName(item.category)}</p>
              <div className="hidden grid-cols-4 gap-2 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                {item.models.map((model) => (
                  <div className="relative" key={model.id}>
                    <ImageModelCard
                      displayName={model.displayName}
                      thumbnailImageURL={model.thumbnailImageURL}
                      type={model.type}
                      isActive={props.selectedModelId === model.id}
                      onSelect={() => {
                        if (model.type === null) return
                        props.onSelect(
                          model.id,
                          model.type,
                          model?.prompts.join(",") ?? "",
                        )
                      }}
                    />
                    {model.isNew && (
                      <span className="absolute bottom-8 left-2 rounded bg-blue-500 px-2 py-1 font-bold text-white text-xs">
                        {"New"}
                      </span>
                    )}
                    <Button
                      className="absolute top-2 right-2"
                      aria-label={t("お気に入り", "Favorites")}
                      size={"icon"}
                      variant="ghost"
                      onClick={() => {
                        if (isSelectorOpen) return
                        props.onChangeFavoritedModel(
                          Number(model.id),
                          isFavorited(Number(model.id)) ? 0 : 1,
                        )
                      }}
                    >
                      <StarIcon
                        className={cn(
                          isFavorited(Number(model.id))
                            ? "fill-yellow-500"
                            : "",
                        )}
                      />
                    </Button>
                    {model.explanation && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          {/* <Button
                            className="absolute top-28 right-0 z-50 hover:bg-transparent"
                            size="icon"
                            variant="ghost"
                          > */}
                          <InfoIcon className="absolute right-4 bottom-10 z-50 h-4 w-4 fill-white text-neutral-950 hover:bg-transparent" />
                          {/* </Button> */}
                        </HoverCardTrigger>
                        <HoverCardContent
                          className="w-80 rounded-lg border border-gray-200 bg-white/95 p-4 text-gray-900 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-white"
                          side="top"
                          align="end"
                        >
                          <p className="text-sm">{model.explanation}</p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                ))}
              </div>
              <div className="block md:hidden">
                {item.models.map((model) => (
                  <div className="relative mt-2" key={model?.id}>
                    <ConfigModelButton
                      imageURL={model?.thumbnailImageURL ?? ""}
                      name={model?.displayName ?? ""}
                      isSelected={props?.selectedModelId === model.id}
                      type={model?.type ?? ""}
                      isDisabled={isSelectorOpen}
                      isHideSearchButton={true}
                      onClick={() => {
                        if (model.type === null) return
                        props.onSelect(
                          model.id,
                          model.type,
                          model?.prompts.join(",") ?? "",
                        )
                      }}
                      onSearchClick={() => {
                        if (isSelectorOpen) return
                        props.onSearchClick(model.id, model.displayName)
                      }}
                    />
                    {model.isNew && (
                      <span className="absolute bottom-2 left-2 rounded bg-blue-500 px-2 py-1 font-bold text-white text-xs">
                        {"New"}
                      </span>
                    )}
                    <Button
                      className="absolute top-8 right-2"
                      aria-label={t("お気に入り", "Favorites")}
                      size={"icon"}
                      variant="ghost"
                      onClick={() => {
                        props.onChangeFavoritedModel(
                          Number(model.id),
                          isFavorited(Number(model.id)) ? 0 : 1,
                        )
                      }}
                    >
                      <StarIcon
                        className={cn(
                          isFavorited(Number(model.id))
                            ? "fill-yellow-500"
                            : "",
                        )}
                      />
                    </Button>
                    {model.explanation && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <InfoIcon className="absolute top-11 right-14 z-50 h-4 w-4 fill-white text-neutral-950 " />
                        </HoverCardTrigger>
                        <HoverCardContent
                          className="w-80 rounded-lg border border-gray-200 bg-white/95 p-4 text-gray-900 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-white"
                          side="top"
                          align="end"
                        >
                          <p className="text-sm">{model.explanation}</p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
