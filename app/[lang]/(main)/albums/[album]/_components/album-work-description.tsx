"use client"

import { AlbumQuery } from "@/__generated__/apollo"
import { FollowButton } from "@/app/_components/button/follow-button"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { AvatarImage } from "@radix-ui/react-avatar"

type Props = {
  albumQuery: AlbumQuery
}

export const AlbumWorkDescription = (props: Props) => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex">
            <Avatar>
              <AvatarImage
                src={props.albumQuery.album?.thumbnailImage?.downloadURL ?? ""}
                alt={props.albumQuery.album?.title}
              />
            </Avatar>
            <p>{props.albumQuery.album?.user.name}</p>
          </div>
          <div className="flex">
            <FollowButton />
          </div>
          <p>{props.albumQuery.album?.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
