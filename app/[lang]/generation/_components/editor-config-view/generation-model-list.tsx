import { GenerationModelSection } from "@/app/[lang]/generation/_components/editor-config-view/generation-model-section"
import { ImageModelCard } from "@/app/[lang]/generation/_components/editor-config-view/image-model-card"
import { StarButton } from "@/app/[lang]/generation/_components/editor-config-view/star-button"
import { toCategoryName } from "@/app/[lang]/generation/_utils/to-category-name"
import { removeDuplicates } from "@/app/_utils/remove-duplicates"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { useState } from "react"

type Props = {
  models: ImageModelsQuery["imageModels"]
  selectedModelId: string | null
  favoritedModelIds: number[]
  onChangeFavoritedModel(modelId: number, rating: number): void
  onSelect(id: string, type: string): void
}

export const GenerationModelListView = (props: Props) => {
  const [selectedType, selectType] = useState("ALL")

  const [selectedCategory, selectCategory] = useState("ALL")

  const [isFavoriteMode, setFavoriteMode] = useState(false)

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
  const isFavoriteModel = (modelId: number) => {
    return props.favoritedModelIds.includes(modelId)
  }

  /**
   * カテゴリーのセクション
   * 種別ごとにモデルを表示
   */
  const categorySections = activeCategories.map((category) => {
    const models = props.models
      .filter((m) => (isFavoriteMode ? isFavoriteModel(Number(m.id)) : true))
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
        <StarButton
          isActive={isFavoriteMode}
          onClick={() => {
            setFavoriteMode((prev) => !prev)
          }}
        />
      </div>
      <ScrollArea className="overflow-auto -mx-4 max-h-[50vh] min-h-[50vh]">
        <div className="space-y-4">
          {removeDuplicates(categorySections).map((item) => (
            <GenerationModelSection
              key={item.category}
              title={toCategoryName(item.category)}
            >
              {item.models.map((model) => (
                <ImageModelCard
                  key={model.id}
                  displayName={model.displayName}
                  thumbnailImageURL={model.thumbnailImageURL}
                  type={model.type}
                  isActive={props.selectedModelId === model.id}
                  isFavoriteModel={isFavoriteModel(Number(model.id))}
                  onSelect={() => {
                    if (model.type === null) return
                    props.onSelect(model.id, model.type)
                  }}
                  onStar={() => {
                    props.onChangeFavoritedModel(
                      Number(model.id),
                      isFavoriteModel(Number(model.id)) ? 0 : 1,
                    )
                  }}
                />
              ))}
            </GenerationModelSection>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
