"use client"

import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Card, CardContent } from "@/components/ui/card"
import { AlbumWorksQuery } from "@/graphql/__generated__/graphql"
import { HeartIcon } from "lucide-react"

type Props = {
  albumWorksQuery: AlbumWorksQuery
  title: string
  thumbnailImageUrl: string
  likesCount: number
  createdAt: number
}

export const AlbumWork = (props: Props) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <p>{props.title}</p>
        <HeartIcon />
      </div>
      <CardContent>
        <div className="flex">
          <img src={props.thumbnailImageUrl} alt={props.title} />
          <div className="flex flex-col">
            <p>{`いいね数：${props.likesCount}`}</p>
            <p>{`閲覧数：${""}`}</p>
            <p>{`使用AI：${""}`}</p>
            <p>{`投稿時間：${toDateTimeText(props.createdAt)}`}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
