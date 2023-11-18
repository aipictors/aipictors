import { Card, CardContent } from "@/components/ui/card"
import { Download, Stamp } from "lucide-react"
import Link from "next/link"

type Props = {
  id: string
  title?: string
  imageURL: string | null
  downloadsCount?: number
  usesCount?: number
}

export const StickerCard = (props: Props) => {
  return (
    <Card>
      <CardContent>
        <Link href={`https://www.aipictors.com/stamp/?id=${props.id}`}>
          <img
            className="rounded-lg"
            src={props.imageURL ?? ""}
            alt={props.title ?? "no title"}
          />
        </Link>
        <div className="flex flex-col justify-between h-full space-y-1 p-2">
          <p className="text-sm font-bold">{props.title ?? "no title"}</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Download />
              <p className="text-sm">{props.downloadsCount}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Stamp />
              <p className="text-sm">{props.usesCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
