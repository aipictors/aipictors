import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"

type Props = {
  postAccessType: IntrospectionEnum<"AccessType">
  createdAt: number
}

/**
 * 作品バナー
 */
export function PostAccessTypeBanner(props: Props) {
  const t = useTranslation()

  const accessTypeText = () => {
    switch (props.postAccessType) {
      case "PUBLIC":
        return ""
      case "PRIVATE":
        return t("非公開（アーカイブ）", "Private (Archived)")
      case "DRAFT":
        return t("下書き", "Draft")
      case "LIMITED":
        return t(
          "限定公開（URLを知っているユーザのみ公開）",
          "Limited (Only users with the URL can view)",
        )
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
    if (props.createdAt * 1000 > Date.now()) {
      return t("予約投稿", "Scheduled Post")
    }
    return ""
  }

  if (accessTypeText() === "" && getFuturePost() === "") {
    return null
  }

  return (
    <div
      className={cn(
        "flex h-12 w-full items-center justify-center rounded-md bg-opacity-20 font-bold",
        `${getBackgroundColor()} bg-opacity-50`,
      )}
    >
      <div className="flex items-center justify-center">
        <span className="ml-2">{accessTypeText()}</span>
        <span className="ml-2">{getFuturePost()}</span>
      </div>
    </div>
  )
}
