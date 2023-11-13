"use client"

import { toElapsedTimeText } from "@/app/_utils/to-elapsed-time-text"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

type Props = {
  text: string
  iconImageURL: string
  createdAt: number
}

export const RecipientMessage: React.FC<Props> = (props) => {
  return (
    <div className="flex space-x-4 items-start">
      <Avatar>
        <AvatarImage src={props.iconImageURL} alt="avatar" />
      </Avatar>
      <div className="max-w-sm">
        <Card className="px-6 py-2 rounded-tr-xl rounded-tl-sm rounded-br-xl rounded-bl-xl">
          <p className="whitespace-pre-wrap">{props.text}</p>
        </Card>
        <div className="flex justify-end">
          <p className="text-xs">{toElapsedTimeText(props.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}
