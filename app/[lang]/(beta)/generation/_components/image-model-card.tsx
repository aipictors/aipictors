import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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

export const ImageModelCard = ({
  models,
  onSelect,
  selectedModelId,
}: Props) => {
  return (
    <ScrollArea className="max-h-96 rounded-md overflow-visible">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {models.map((imageModel) => (
          <div key={imageModel.id} className="relative">
            <img
              className={cn(
                "h-auto rounded cursor-pointer transition duration-300",
                selectedModelId === imageModel.id
                  ? "ring shadow-lg transform-gpu scale-105 z-10"
                  : "hover:shadow-md",
              )}
              src={imageModel.thumbnailImageURL ?? ""}
              alt={imageModel.displayName ?? ""}
              onClick={() => onSelect(imageModel.id)}
              style={{
                transformOrigin: "center",
              }}
            />
            <span className="text-sm font-bold break-words whitespace-pre-wrap">
              {imageModel.displayName ?? ""}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
