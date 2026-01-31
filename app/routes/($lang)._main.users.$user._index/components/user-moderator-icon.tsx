import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"

type Props = {
  isModerator: boolean
}

export function UserModeratorIcon (props: Props) {
  const iconUrl = () => {
    if (props.isModerator) {
      return "https://assets.aipictors.com/aipictors_blue_mark.webp"
    }
    return null
  }

  const iconDescription = () => {
    if (props.isModerator) {
      return "このアカウントはコントリビュータとして認証されたユーザです"
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
        <img src={url} alt="Aipictorsモデレーターアイコン" className="h-4" />
      </PopoverTrigger>
      <PopoverContent className="whitespace-pre-wrap font-size-md">
        {iconDescription()}
      </PopoverContent>
    </Popover>
  )
}
