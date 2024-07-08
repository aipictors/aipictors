import { Card, CardContent } from "@/_components/ui/card"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { graphql, type ResultOf } from "gql.tada"
import { HeartIcon } from "lucide-react"

type Props = {
  albumWorks: NonNullable<ResultOf<typeof albumWorksQuery>["album"]>["works"]
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

export const albumWorksQuery = graphql(
  `query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
