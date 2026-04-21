import { Link } from "@remix-run/react"
import { Layers3 } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  album: {
    title: string
    description: string
    slug?: string | null
    user?: {
      login?: string | null
    } | null
  }
}

export function WorkAlbumCard(props: Props) {
  const href =
    props.album.slug && props.album.user?.login
      ? `/${props.album.user.login}/albums/${props.album.slug}`
      : null

  const card = (
    <Card className="border-dashed">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="rounded-full bg-muted p-2 text-muted-foreground">
          <Layers3 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge variant="secondary" className="mb-2">
            シリーズ
          </Badge>
          <div className="font-semibold">{props.album.title}</div>
          {props.album.description.length > 0 && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {props.album.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (href === null) {
    return card
  }

  return <Link to={href}>{card}</Link>
}