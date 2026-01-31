import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  passType?: IntrospectionEnum<"PassType">
}

export function UserSubscriptionIcon (props: Props) {
  const iconUrl = () => {
    if (props.passType === "PREMIUM") {
      return "https://assets.aipictors.com/aipictors_stainless_premium_mark.webp"
    }
    if (props.passType === "STANDARD") {
      return "https://assets.aipictors.com/aipictors_mark.webp"
    }
    if (props.passType === "LITE") {
      return "https://assets.aipictors.com/aipictors_stainless_steel_mark.webp"
    }
    return null
  }

  const iconDescription = () => {
    if (props.passType === "PREMIUM") {
      return "このアカウントはプレミアムプランで認証されたユーザです"
    }
    if (props.passType === "STANDARD") {
      return "このアカウントはスタンダードプランで認証されたユーザです"
    }
    if (props.passType === "LITE") {
      return "このアカウントはライトプランで認証されたユーザです"
    }
    return null
  }

  const url = iconUrl()

  if (url === null) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <img src={url} alt="Aipictorsサブスクアイコン" className="h-4" />
      </PopoverTrigger>
      <PopoverContent className="whitespace-pre-wrap font-size-md">
        {iconDescription()}
      </PopoverContent>
    </Popover>
  )
}
