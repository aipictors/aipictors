import { ImageModelCard } from "@/app/[lang]/generation/_components/editor-config-view/image-model-card"
import { toCategoryName } from "@/app/[lang]/generation/_utils/to-category-name"
import { removeDuplicates } from "@/app/_utils/remove-duplicates"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { cn } from "@/lib/utils"
import { StarIcon } from "lucide-react"
import { useState } from "react"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  favoritedModelIds: number[]
  onChangeFavoritedModel(modelId: number, rating: number): void
  onSelect(id: string, type: string, prompt: string): void
}

export const ImageModelsList = (props: Props) => {
  const [selectedType, selectType] = useState("ALL")

  const [selectedCategory, selectCategory] = useState("ALL")

  const [showFavoriteModels, setShowFavoriteModels] = useState(false)

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

  /**
   * カテゴリーのセクション
   * 種別ごとにモデルを表示
   */
  const categorySections = activeCategories.map((category) => {
    const models = !showFavoriteModels
      ? props.models
      : props.models
          .filter((m) => isFavorited(Number(m.id)))
          .filter((m) => {
            return m.category === category
          })
          .filter((m) => {
            return selectedType === "ALL" || m.type === selectedType
          })
    if (models.length === 0) return null
    return { category, models }
  })

  return (
    <>
      <div className="flex gap-x-2">
        <Select onValueChange={selectCategory}>
          <SelectTrigger className="w-40">
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
        <Select onValueChange={selectType}>
          <SelectTrigger className="w-40">
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
      <ScrollArea className="overflow-auto -mx-4 max-h-[50vh] min-h-[50vh]">
        <div className="space-y-4">
          {removeDuplicates(categorySections).map((item) => (
            <div key={item.category} className="px-4 space-y-2">
              <p className="font-bold">{toCategoryName(item.category)}</p>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                {item.models.map((model) => (
                  <div className="relative">
                    <ImageModelCard
                      key={model.id}
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
                      className="absolute right-2 top-2"
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
