import { Card, CardContent } from "~/components/ui/card"
import { DownloadIcon, StampIcon } from "lucide-react"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  sticker: FragmentOf<typeof StickerCardFragment>
}

export function StickerCard(props: Props) {
  return (
    <article>
      <Card className="h-full">
        <img
          className="rounded-lg"
          src={props.sticker.imageUrl ? props.sticker.imageUrl : ""}
          alt={props.sticker.title ? props.sticker.title : "no title"}
        />
        <CardContent className="flex flex-col justify-between space-y-1 p-2">
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-sm">
            {props.sticker.title ? props.sticker.title : "no title"}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex">
              <DownloadIcon className="mr-2 w-4" />
              <span>{props.sticker.downloadsCount}</span>
            </div>
            <div className="flex">
              <StampIcon className="mr-2 w-4" />
              <span>{props.sticker.usesCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  )
}

export const StickerCardFragment = graphql(
  `fragment StickerCard on StickerNode {
    id
    title
    imageUrl
    downloadsCount
    usesCount
  }`,
)
