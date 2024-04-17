import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarFallback } from "@/_components/ui/avatar"
import { Card, CardContent } from "@/_components/ui/card"
import type { AlbumQuery } from "@/_graphql/__generated__/graphql"
import { AvatarImage } from "@radix-ui/react-avatar"

type Props = {
  album: NonNullable<AlbumQuery["album"]>
}

export const AlbumWorkDescription = (props: Props) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex">
            <Avatar>
              <AvatarImage
                src={props.album.thumbnailImage?.downloadURL ?? ""}
                alt={props.album.title}
              />
              <AvatarFallback />
            </Avatar>
            <p>{props.album.user.name}</p>
          </div>
          <div className="flex">
            <FollowButton />
          </div>
          <p>{props.album.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
