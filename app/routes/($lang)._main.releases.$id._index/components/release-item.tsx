import { Badge } from "~/components/ui/badge"
import { ImagesPreview } from "~/components/images-preview"
import { AppMarkdown } from "~/components/app/app-markdown"

type Props = {
  title: string
  description: string
  thumbnailUrl: string | null
  platform: string
  createdAt: number
  tag?: string | null
}

/**
 * リリース情報アイテム
 */
export function ReleaseItem(props: Props) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <>
      <div className="font-bold text-lg">{props.title}</div>
      <div className="flex items-center space-x-2">
        <div className="block text-muted-foreground text-xs">
          {formatDate(props.createdAt)}
        </div>
        {(props.tag || props.platform) && (
          <Badge variant={"secondary"} className="text-xs">
            <p className="w-auto text-center">{props.tag || props.platform}</p>
          </Badge>
        )}
      </div>
      <div className="mt-4 rounded-lg bg-zinc-100 bg-opacity-50 p-4 text-sm dark:bg-zinc-900">
        <AppMarkdown breaks>{props.description}</AppMarkdown>
      </div>
      {props.thumbnailUrl && (
        <ImagesPreview
          thumbnailUrl={props.thumbnailUrl}
          imageURLs={[props.thumbnailUrl]}
          currentIndex={0}
          setCurrentIndex={() => {}}
        />
      )}
    </>
  )
}
