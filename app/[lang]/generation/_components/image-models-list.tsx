import { ImageModelCard } from "@/app/[lang]/generation/_components/image-model-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Key, useMemo, useState } from "react"

type ImageModel = {
  id: string
  displayName: string | null
  type: string | null
  category: string | null
  thumbnailImageURL: string | null
}

type Props = {
  models: ImageModel[]
  onSelect(id: string, type: string): void
  selectedModelId: string | null
}

export const getTypeName = (type: string) => {
  if (type === "ILLUSTRATION_GIRL") {
    return "美少女イラスト"
  }
  if (type === "ANIMAL") {
    return "獣系"
  }
  if (type === "BIKINI_MODEL") {
    return "グラビア"
  }
  if (type === "ILLUSTRATION_BOY") {
    return "美男子イラスト"
  }
  if (type === "FIGURE") {
    return "美少女フィギュア"
  }
  if (type === "BACKGROUND") {
    return "背景"
  }
  return type
}

export const ImageModelsList = (props: Props) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all")

  const uniqueTypes = useMemo(() => {
    const types = new Set(props.models.map((model) => model.type))
    return [
      "all",
      ...Array.from(types).flatMap((item) => {
        return item === null ? [] : [item]
      }),
    ]
  }, [props.models])

  const uniqueCategories = useMemo(() => {
    const categories = new Set(props.models.map((model) => model.category))
    return [
      "all",
      ...Array.from(categories).flatMap((item) => {
        return item === null ? [] : [item]
      }),
    ]
  }, [props.models])

  const filteredModels = props.models.filter(
    (model) =>
      (selectedTypeFilter === "all" || model.type === selectedTypeFilter) &&
      (selectedCategoryFilter === "all" ||
        model.category === selectedCategoryFilter),
  )

  const groupedModels = useMemo(() => {
    const groups = new Map()
    // biome-ignore lint/complexity/noForEach: <explanation>
    filteredModels.forEach((model) => {
      if (!groups.has(model.category)) {
        groups.set(model.category, [])
      }
      groups.get(model.category).push(model)
    })
    return groups
  }, [filteredModels])

  return (
    <>
      <div className="flex pl-4">
        <Select onValueChange={setSelectedCategoryFilter}>
          <SelectTrigger className="w-[160px] mr-2">
            <SelectValue placeholder={"カテゴリ"} />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {getTypeName(category ?? "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={"種別"} />
          </SelectTrigger>
          <SelectContent>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="max-h-[80vh] rounded-md overflow-visible">
        {/* 種別ごとにモデルを表示 */}
        {Array.from(groupedModels.entries()).map(([type, models]) => (
          <div key={type}>
            <p className="font-bold pl-4">{getTypeName(type)}</p>
            <div className="grid grid-cols-3 gap-2 p-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
              {models.map(
                (imageModel: {
                  id: Key | null | undefined
                  displayName: string | null
                  thumbnailImageURL: string | null
                  type: string | null | undefined
                }) => (
                  <ImageModelCard
                    key={imageModel.id}
                    displayName={imageModel.displayName}
                    thumbnailImageURL={imageModel.thumbnailImageURL}
                    type={imageModel.type}
                    isActive={props.selectedModelId === imageModel.id}
                    onSelect={() => {
                      props.onSelect(
                        String(imageModel.id),
                        imageModel.type ?? "",
                      )
                    }}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </ScrollArea>
    </>
  )
}
