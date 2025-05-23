import { Dialog, DialogContent } from "~/components/ui/dialog"
import { useState } from "react"
import { useQuery } from "@apollo/client/index"
import { Button } from "~/components/ui/button"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Card } from "~/components/ui/card"
import { graphql } from "gql.tada"
import { cn } from "~/lib/utils"

type Props = {
  onSubmit: (
    selectedImage: string[],
    selectedIds: string[],
    lastSelectedOriginalImage: string,
  ) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function ImageGenerationSelectorDialog(props: Props) {
  const { data: imageGenerationResults } = useQuery(
    viewerImageGenerationResultsQuery,
    {
      variables: {
        limit: 96,
        offset: 0,
        where: {},
      },
    },
  )

  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastSelectedOriginalImage, setLastSelectedOriginalImage] =
    useState<string>("")

  const handleImageClick = async (imageUrl: string, id: string) => {
    try {
      const base64Image = await getBase64FromImageUrl(imageUrl, "image/webp")
      setSelectedImages((prevSelected) => {
        if (prevSelected.includes(base64Image)) {
          return prevSelected.filter((image) => image !== base64Image)
        }
        return [...prevSelected, base64Image]
      })
      setSelectedIds((prevSelected: string[]) => {
        if (prevSelected.includes(id)) {
          return prevSelected.filter((selectedId) => selectedId !== id)
        }
        return [...prevSelected, id]
      })
      setLastSelectedOriginalImage(imageUrl)
    } catch (error) {
      console.error("Error converting image to base64:", error)
    }
  }

  const handleSubmit = () => {
    props.onSubmit(selectedImages, selectedIds, lastSelectedOriginalImage)
    props.setIsOpen(false)
  }

  return (
    <Dialog open={props.isOpen}>
      <DialogContent>
        <ScrollArea className="max-h-[80vh]">
          <div className="flex h-[80vh] flex-wrap gap-x-2 gap-y-2">
            {imageGenerationResults?.viewer?.imageGenerationResults.map(
              (result) => (
                <Card
                  key={result.id}
                  onClick={() =>
                    handleImageClick(result.imageUrl ?? "", result.id)
                  }
                  className={cn("size-24 overflow-hidden", {
                    "border-4 border-blue-500": selectedIds.includes(result.id),
                  })}
                >
                  <img
                    className="size-24 rounded-md object-cover"
                    src={result.thumbnailUrl ?? ""}
                    alt={""}
                  />
                </Card>
              ),
            )}
          </div>
        </ScrollArea>
        <div className="ml-auto flex space-x-2">
          <Button
            variant={"secondary"}
            onClick={() => {
              props.setIsOpen(false)
            }}
          >
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>決定</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const viewerImageGenerationResultsQuery = graphql(
  `query ViewerImageGenerationResults($offset: Int!, $limit: Int!, $where: ImageGenerationResultsWhereInput) {
    viewer {
      id
      imageGenerationResults(offset: $offset, limit: $limit, where: $where) {
        id
        imageUrl
        thumbnailUrl
      }
    }
  }`,
)
