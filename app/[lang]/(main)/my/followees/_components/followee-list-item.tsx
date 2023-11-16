import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AvatarImage } from "@radix-ui/react-avatar"

type Props = {
  name: string
  imageURL?: string
}

export const FolloweeListItem = (props: Props) => {
  return (
    <div className="flex">
      <div className="flex">
        <Avatar
        //  bg="teal.500"
        >
          <AvatarImage src={props.imageURL} />
        </Avatar>
        <div>
          <p>{props.name}</p>
        </div>
      </div>
      <Button>{"フォロー中"}</Button>
    </div>
  )
}
