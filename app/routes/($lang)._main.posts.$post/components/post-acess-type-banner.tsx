import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  postAccessType: IntrospectionEnum<"AccessType">
  createdAt: number
}

/**
 * 作品バナー
 */
export const PostAccessTypeBanner = (props: Props) => {
  const accessTypeText = () => {
    switch (props.postAccessType) {
      case "PUBLIC":
        return ""
      case "PRIVATE":
        return "非公開（アーカイブ）"
      case "DRAFT":
        return "下書き"
      case "LIMITED":
        return "限定公開（URLを知っているユーザのみ公開）"
      default:
        return ""
    }
  }

  const getBackgroundColor = () => {
    switch (props.postAccessType) {
      case "PUBLIC":
        return "bg-green-500"
      case "PRIVATE":
        return "bg-red-500"
      case "DRAFT":
        return "bg-gray-500"
      case "LIMITED":
        return "bg-zinc-500"
      default:
        return "bg-black"
    }
  }

  const getFuturePost = () => {
    if (props.createdAt * 1000 > new Date().getTime()) {
      return "予約投稿"
    }
    return ""
  }

  if (accessTypeText() === "" && getFuturePost() === "") {
    return null
  }

  return (
    <div
      className={`flex h-12 w-full items-center justify-center rounded-md bg-opacity-20 ${getBackgroundColor()} bg-opacity-50 font-bold`}
    >
      <div className="flex items-center justify-center">
        <span className="ml-2">{accessTypeText()}</span>
        <span className="ml-2">{getFuturePost()}</span>
      </div>
    </div>
  )
}
