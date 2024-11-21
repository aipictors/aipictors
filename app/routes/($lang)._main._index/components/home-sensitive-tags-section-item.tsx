import {} from "~/components/ui/carousel"
import { Link } from "@remix-run/react"

type Props = {
  tagThumbnailUrl: string
  tagName: string
}

export function HomeSensitiveTagsSectionItem(props: Props) {
  return (
    <div className="group relative overflow-hidden rounded-md">
      <Link to={`/r/tags/${props.tagName}`} className="rounded-md">
        <img
          className="h-[240px] w-[196px] bg-white object-cover object-center transition-transform duration-200 ease-in-out group-hover:scale-105"
          src={props.tagThumbnailUrl}
          alt={props.tagName}
        />
        <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-88">
          <p className="text-white">{`#${props.tagName}`}</p>
        </div>
      </Link>
    </div>
  )
}
