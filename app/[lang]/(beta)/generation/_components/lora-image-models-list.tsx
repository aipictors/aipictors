import { ImageModelCard } from "@/app/[lang]/(beta)/generation/_components/image-model-card"
import { ScrollArea } from "@/components/ui/scroll-area"

type Model = {
  id: string
  name: string
  description: string | null
  thumbnailImageURL: string | null
}

type Props = {
  models: Model[]
  selectedModelNames: string[]
  onSelect(id: string): void
}

export const LoraImageModelsList = (props: Props) => {
  return (
    <ScrollArea className="h-full max-h-96">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {props.models.map((model) => (
          <ImageModelCard
            key={model.id}
            displayName={model.name}
            isActive={props.selectedModelNames.includes(model.name)}
            thumbnailImageURL={model.thumbnailImageURL}
            description={model.description}
            onSelect={() => {
              props.onSelect(model.name)
            }}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
