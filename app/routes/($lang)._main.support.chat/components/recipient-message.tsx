import { Avatar, AvatarImage } from "~/components/ui/avatar"
import { Card } from "~/components/ui/card"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { AvatarFallback } from "@radix-ui/react-avatar"

type Props = {
  text: string
  iconImageURL: string
  createdAt: number
}

export const RecipientMessage = (props: Props) => {
  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={props.iconImageURL} alt="avatar" />
        <AvatarFallback />
      </Avatar>
      <div className="flex max-w-sm flex-col gap-y-2">
        <Card className="rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl px-6 py-2">
          <p className="overflow-hidden whitespace-pre-wrap break-words">
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
