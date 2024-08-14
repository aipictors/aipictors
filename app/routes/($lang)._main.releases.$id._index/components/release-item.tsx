import { Badge } from "~/components/ui/badge"

type Props = {
  title: string
  description: string
  thumbnailUrl: string | null
  platform: string
  createdAt: number
}

/**
 * リリース情報アイテム
 */
export function ReleaseItem(props: Props) {
  const { title, description, thumbnailUrl, platform, createdAt } = props

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <>
      <div className="font-bold text-lg">{title}</div>
      <Badge variant={"secondary"} className="w-12 text-xs">
        <p className="w-auto text-center">{platform}</p>
      </Badge>
      <div className="whitespace-pre text-wrap text-sm">{description}</div>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          className="m-auto mb-4 h-32 w-full max-w-64 rounded object-cover"
        />
      )}
      <div className="mt-4 text-gray-400 text-xs">{formatDate(createdAt)}</div>
    </>
  )
}
