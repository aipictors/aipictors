import { ScrollArea } from "~/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ImageModelCard } from "~/routes/($lang).generation._index/components/config-view/image-model-card"
import { useMemo, useState } from "react"

type Model = {
  id: string
  name: string
  triggerWord?: string
  description: string | null
  thumbnailImageURL: string | null
  genre: string
}

type Props = {
  models: Model[]
  selectedModelNames: string[]
  onSelect(name: string, triggerWord?: string): void
}

export function LoraImageModelList (props: Props) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all")

  const genres = useMemo(() => {
    const uniqueGenres = new Set(props.models.map((model) => model.genre))
    return ["all", ...Array.from(uniqueGenres)]
  }, [props.models])

  const filteredModels = useMemo(() => {
    return selectedGenre === "all"
      ? props.models
      : props.models.filter((model) => model.genre === selectedGenre)
  }, [props.models, selectedGenre])

  return (
    <>
      <Select onValueChange={setSelectedGenre}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={"ジャンルを選択"} />
        </SelectTrigger>
        <SelectContent>
          {genres.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ScrollArea className="h-full max-h-[64vh]">
        <div className="grid min-h-[80vh] grid-cols-3 gap-4 pr-4 md:grid-cols-8 lg:grid-cols-7 xl:grid-cols-12">
          {filteredModels.map((model) => (
            <div key={model.id}>
              <ImageModelCard
                key={model.id}
                displayName={""}
                isActive={props.selectedModelNames.includes(model.name)}
                thumbnailImageURL={model.thumbnailImageURL}
                description={model.description}
                onSelect={() => {
                  props.onSelect(model.name, model.triggerWord ?? undefined)
                }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
