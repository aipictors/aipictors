import { toElapsedTimeText } from "@/app/_utils/to-elapsed-time-text"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { AvatarFallback } from "@radix-ui/react-avatar"

type Props = {
  text: string
  iconImageURL: string
  createdAt: number
}

export const RecipientMessage = (props: Props) => {
  return (
    <div className="flex space-x-4 items-start">
      <Avatar>
        <AvatarImage src={props.iconImageURL} alt="avatar" />
        <AvatarFallback />
      </Avatar>
      <div className="max-w-sm flex flex-col gap-y-2">
        <Card className="px-6 py-2 rounded-tr-xl rounded-tl-sm rounded-br-xl rounded-bl-xl">
          <p className="whitespace-pre-wrap overflow-hidden break-words">
            {props.text}
          </p>
        </Card>
        <div className="flex justify-end">
          <p className="text-xs">{toElapsedTimeText(props.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}
