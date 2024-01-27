import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Model = {
  id: string
  name: string
  description: string | null
  thumbnailImageURL: string | null
}

type Props = {
  models: Model[]
  selectedModelIds: string[]
  onSelect(id: string): void
}

export const LoraImageModelCard = ({
  models,
  selectedModelIds,
  onSelect,
}: Props) => {
  return (
    <ScrollArea className="h-full max-h-96">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {models.map((model) => (
          <div key={model.id} className="flex flex-col gap-y-2">
            <img
              className={cn(
                "h-auto rounded cursor-pointer transition duration-300",
                selectedModelIds.includes(model.id)
                  ? "ring shadow-lg transform-gpu scale-105 z-10"
                  : "hover:shadow-md",
              )}
              src={model.thumbnailImageURL ?? ""}
              alt={model.name}
              onClick={() => onSelect(model.id)}
              style={{
                transformOrigin: "center",
              }}
            />
            <div className="flex flex-col space-y-1">
              <span className="text-sm break-words whitespace-pre-wrap font-bold">
                {model.name}
              </span>
              <span className="text-sm break-words whitespace-pre-wrap">
                {model.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
