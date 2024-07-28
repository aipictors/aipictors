import { Card, CardContent } from "~/components/ui/card"
import { DownloadIcon, StampIcon } from "lucide-react"

type Props = {
  title?: string
  imageURL: string | null
  downloadsCount?: number
  usesCount?: number
}

export const StickerCard = (props: Props) => {
  return (
    <article>
      <Card className="h-full">
        <img
          className="rounded-lg"
          src={props.imageURL ?? ""}
          alt={props.title ?? "no title"}
        />
        <CardContent className="flex flex-col justify-between space-y-1 p-2">
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-sm">
            {props.title ?? "no title"}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex">
              <DownloadIcon className="mr-2 w-4" />
              <span>{props.downloadsCount}</span>
            </div>
            <div className="flex">
              <StampIcon className="mr-2 w-4" />
              <span>{props.usesCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  )
}
