import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Badge } from "@/_components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card"
import { PromptonRequestButton } from "@/routes/($lang)._main.works.$work/_components/prompton-request-button"

type Props = {
  userName: string
  userIconImageURL?: string
  userFollowersCount: number
  userBiography: string | null
  userPromptonId?: string
  userWorksCount: number
}

/**
 * 作品へ投稿しているユーザの投稿数、フォロワ数、フォローするボタン等の情報
 */
export const WorkUser = (props: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-x-2 p-4">
          <Avatar>
            <AvatarImage src={props.userIconImageURL} alt="" />
            <AvatarFallback />
          </Avatar>
          <p className="text-md">{props.userName}</p>
        </CardTitle>
        {props.userBiography && (
          <CardDescription>{props.userBiography}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="justify-between">
        <Badge>{`投稿数 ${props.userWorksCount}`}</Badge>
        <Badge>{`フォロワー ${props.userFollowersCount}`}</Badge>
      </CardContent>
      <CardFooter className="flex justify-between">
        <FollowButton className="flex-1" />
        {props.userPromptonId && <PromptonRequestButton className="flex-1" />}
      </CardFooter>
    </Card>
  )
}