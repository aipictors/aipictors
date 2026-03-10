import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"

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

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedSourceUrlsById, setSelectedSourceUrlsById] = useState<
    Record<string, string>
  >({})
  const [selectedBase64ById, setSelectedBase64ById] = useState<
    Record<string, string>
  >({})
  const [lastSelectedOriginalImage, setLastSelectedOriginalImage] =
    useState<string>("")

  const handleImageClick = async (
    imageUrl: string | null,
    thumbnailUrl: string | null,
    id: string,
  ) => {
    const sourceUrl = imageUrl || thumbnailUrl
    if (!sourceUrl) {
      return
    }

    const isSelected = selectedIds.includes(id)

    // 先に選択状態だけ切り替える（青枠を即時反映）
    setSelectedIds((prevSelected) =>
      isSelected
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id],
    )

    if (isSelected) {
      setSelectedSourceUrlsById((prev) => {
        const { [id]: _removed, ...rest } = prev
        return rest
      })
      setSelectedBase64ById((prev) => {
        const { [id]: _removed, ...rest } = prev
        return rest
      })
      return
    }

    setSelectedSourceUrlsById((prev) => ({ ...prev, [id]: sourceUrl }))

    // 生成元画像のURLはCORSでfetchできないケースがあるため、以降の抽出処理向けにプロキシURLを渡す
    setLastSelectedOriginalImage(getDownloadProxyUrl(sourceUrl))
  }

  const handleSubmit = async () => {
    try {
      if (selectedIds.length === 0) {
        props.onSubmit([], [], "")
        props.setIsOpen(false)
        return
      }

      const base64Images = await Promise.all(
        selectedIds.map(async (id) => {
          const cached = selectedBase64ById[id]
          if (cached) return cached

          const sourceUrl = selectedSourceUrlsById[id]
          if (!sourceUrl) {
            throw new Error("選択画像のURLが見つかりませんでした")
          }

          const base64Image = await getBase64FromImageUrl(
            sourceUrl,
            "image/webp",
          )
          setSelectedBase64ById((prev) => ({ ...prev, [id]: base64Image }))
          return base64Image
        }),
      )

      props.onSubmit(base64Images, selectedIds, lastSelectedOriginalImage)
      props.setIsOpen(false)
    } catch (error) {
      console.error(error)
      toast("画像の取得に失敗しました")
    }
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
                    handleImageClick(
                      result.imageUrl,
                      result.thumbnailUrl,
                      result.id,
                    )
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
