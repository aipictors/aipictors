"use client"

import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarFallback } from "@/_components/ui/avatar"
import { Card, CardContent } from "@/_components/ui/card"
import type { AlbumQuery } from "@/_graphql/__generated__/graphql"
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
              <AvatarFallback />
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
