import {} from "@/_components/ui/avatar"
import {} from "@/_components/ui/carousel"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  postAccessType: IntrospectionEnum<"AccessType">
}

/**
 * 作品バナー
 */
export const PostAccessTypeBanner = (props: Props) => {
  console.log(props.postAccessType)

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
        return "bg-yellow-500"
      case "LIMITED":
        return "bg-blue-500"
      default:
        return "bg-black"
    }
  }

  if (accessTypeText() === "") {
    return null
  }

  return (
    <div
      className={`flex h-12 w-full items-center justify-center rounded-md ${getBackgroundColor()} bg-opacity-50 text-white`}
    >
      <div className="flex items-center justify-center">
        <span className="ml-2">{accessTypeText()}</span>
      </div>
    </div>
  )
}
