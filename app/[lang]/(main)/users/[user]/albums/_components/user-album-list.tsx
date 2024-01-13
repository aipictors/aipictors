"use client"

import type { UserAlbumsQuery } from "@/__generated__/apollo"
import WorkCard from "@/app/[lang]/(main)/works/_components/work-card"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

type Props = {
  albums: NonNullable<UserAlbumsQuery["user"]>["albums"]
}

export const UserAlbumList = (props: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <p>{"R18（n）"}</p>
        <Switch />
      </div>
      <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 pr-4 pb-4">
        {props.albums.map((album) => (
          <Link key={album.id} href={`/albums/${album.id}`}>
            <WorkCard imageURL={album.thumbnailImage?.downloadURL} />
          </Link>
        ))}
      </ul>
    </div>
  )
}
