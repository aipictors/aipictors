import { PromptonRequestButton } from "@/app/[lang]/(main)/works/[work]/_components/prompton-request-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Props = {
  userName: string
  userIconImageURL?: string
  userFollowersCount: number
  userBiography: string | null
  userPromptonId?: string
  userWorksCount: number
}

export const WorkUser = (props: Props) => {
  return (
    <Card>
      <div className="p-4 flex flex-col gap-y-4">
        <div className="flex gap-x-4 items-center">
          <Avatar>
            <AvatarImage src={props.userIconImageURL} alt=""/>
            <AvatarFallback/>
          </Avatar>
          <p className="text-md font-bold">{props.userName}</p>
        </div>
        <div className="flex gap-x-2">
          <Badge>{`投稿数 ${props.userWorksCount}`}</Badge>
          <Badge>{`フォロワ数 ${props.userFollowersCount}`}</Badge>
        </div>
        <div className="flex gap-x-2">
          <Button className="flex-1">{"フォローする"}</Button>
          {props.userPromptonId && <PromptonRequestButton className="flex-1" />}
        </div>
        {props.userBiography && (
          <p className="whitespace-pre-wrap overflow-hidden break-words text-sm">
            {props.userBiography}
          </p>
        )}
      </div>
    </Card>
  )
}
