import { ImageModelCard } from "@/app/[lang]/(beta)/generation/_components/image-model-card"
import { ScrollArea } from "@/components/ui/scroll-area"

type ImageModel = {
  id: string
  displayName: string | null
  thumbnailImageURL: string | null
}

type Props = {
  models: ImageModel[]
  onSelect(id: string): void
  selectedModelId: string | null
}

export const ImageModelsList = (props: Props) => {
  return (
    <ScrollArea className="max-h-96 rounded-md overflow-visible">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {props.models.map((imageModel) => (
          <ImageModelCard
            key={imageModel.id}
            displayName={imageModel.displayName}
            thumbnailImageURL={imageModel.thumbnailImageURL}
            isActive={props.selectedModelId === imageModel.id}
            onSelect={() => {
              props.onSelect(imageModel.id)
            }}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
