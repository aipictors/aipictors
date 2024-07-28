import { Card } from "~/components/ui/card"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * 作品プレビュー内容
 */
export const GenerationWorkContentPreview = () => {
  const context = useGenerationContext()

  const previewImageURL = context.config.previewImageURL ?? ""

  if (previewImageURL === "") {
    return null
  }

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        <div className="m-auto max-h-[100vh]">
          <img src={previewImageURL} className={"max-h-[64vh]"} alt={"-"} />
        </div>
      </Card>
    </>
  )
}
