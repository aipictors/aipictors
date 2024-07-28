import { Button } from "~/components/ui/button"
import { Link } from "@remix-run/react"
import { MousePointerClickIcon } from "lucide-react"

type Props = {
  alt: string
  imageURL: string
  linkURL: string
  linkTitle: string
}

export const EventImage = (props: Props) => {
  return (
    <div className="relative">
      <img
        alt={props.alt}
        src={props.imageURL}
        className="w-full rounded-t-md rounded-br-3xl rounded-bl-md object-cover object-top"
      />
      <Link
        className="absolute right-4 bottom-4"
        to={props.linkURL}
        target={"_blank"}
        rel={"noreferrer noopener"}
      >
        <Button className="rounded-full">
          <MousePointerClickIcon />
          <span className="ml-2">{props.linkTitle}</span>
        </Button>
      </Link>
    </div>
  )
}
