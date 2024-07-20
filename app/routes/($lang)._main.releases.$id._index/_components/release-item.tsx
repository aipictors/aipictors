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
export const ReleaseItem = (props: Props) => {
  const { title, description, thumbnailUrl, platform, createdAt } = props

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          className="m-auto mb-4 h-32 w-full max-w-64 rounded object-cover"
        />
      )}
      <div className="font-bold text-lg">{title}</div>
      <div className="mb-2 text-gray-500 text-sm">{platform}</div>
      <div className="text-sm">{description}</div>
      <div className="mt-4 text-gray-400 text-xs">{formatDate(createdAt)}</div>
    </>
  )
}
