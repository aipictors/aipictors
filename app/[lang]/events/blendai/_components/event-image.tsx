import { Button } from "@/_components/ui/button"
import { MousePointerClickIcon } from "lucide-react"

type Props = {
  alt: string
  imageURL: string
}

export const EventImage = (props: Props) => {
  return (
    <div className="relative">
      <img
        alt={props.alt}
        src={props.imageURL}
        className="w-full rounded-t-md rounded-br-3xl rounded-bl-md object-cover object-top"
      />
    </div>
  )
}
