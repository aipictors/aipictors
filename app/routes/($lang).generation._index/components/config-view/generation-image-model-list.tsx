import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { cn } from "~/lib/cn"
import { removeDuplicates } from "~/utils/remove-duplicates"
import { ConfigModelButton } from "~/routes/($lang).generation._index/components/config-view/config-model-button"
import { ImageModelCard } from "~/routes/($lang).generation._index/components/config-view/image-model-card"
import type { ImageModelContextFragment } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { toCategoryName } from "~/routes/($lang).generation._index/utils/to-category-name"
import type { FragmentOf } from "gql.tada"
import { StarIcon } from "lucide-react"
import { useState } from "react"

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
  const [selectedType, selectType] = useState("ALL")

  const [selectedCategory, selectCategory] = useState("ALL")

  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  const [showFavoriteModels, setShowFavoriteModels] = useState(
    props.isInitFavorited,
  )

  /**
   * モデルの種類
   * SD1など
   */
  const modelTypes = removeDuplicates(props.models.map((m) => m.type))

  /**
   * カテゴリ
   * 美少女など
   */
  const modelCategories = removeDuplicates(props.models.map((m) => m.category))

  /**
   * 選択されているカテゴリ
   */
  const activeCategories =
    selectedCategory === "ALL" ? modelCategories : [selectedCategory]

  /**
   * お気に入りのモデルかどうか
   * @param modelId モデルID
   * @returns
   */
  const isFavorited = (modelId: number) => {
    return props.favoritedModelIds.includes(modelId)
  }

  // モデルをフィルタリングする関数
  const filterModels = () => {
    return (
      props.models
        .filter((model) => {
          // お気に入りフィルタリング
          return showFavoriteModels ? isFavorited(Number(model.id)) : true
        })
        .filter((model) => {
          // カテゴリフィルタリング
          return (
            selectedCategory === "ALL" || model.category === selectedCategory
          )
        })
        .filter((model) => {
          // 種別フィルタリング
          return selectedType === "ALL" || model.type === selectedType
        })
        // 追加: displayNameで昇順にソート
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
    )
  }

  // カテゴリセクションの生成
  const categorySections = activeCategories.map((category) => {
    const models = filterModels().filter((m) => m.category === category)
    if (models.length === 0) return null
    return { category, models }
  })

  return (
    <>
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
            <SelectValue placeholder={"カテゴリ"} />
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
            <SelectValue placeholder={"種別"} />
          </SelectTrigger>
          <SelectContent>
            {["ALL", ...modelTypes].map((type) => (
              <SelectItem key={type} value={type}>
                {type === "ALL" ? "全て" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => {
            setShowFavoriteModels((prev) => !prev)
          }}
          aria-label={"お気に入り"}
          size={"icon"}
          variant="ghost"
        >
          <StarIcon
            className={cn(showFavoriteModels ? "fill-yellow-500" : "")}
          />
        </Button>
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
                    <Button
                      className="absolute top-2 right-2"
                      aria-label={"お気に入り"}
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

                    <Button
                      className="absolute top-8 right-2"
                      aria-label={"お気に入り"}
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
