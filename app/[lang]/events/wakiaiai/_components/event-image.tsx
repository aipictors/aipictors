import { Button } from "@/components/ui/button"
import { TbClick } from "react-icons/tb"

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
        className="w-full object-cover object-top rounded-t-md rounded-bl-md rounded-br-3xl"
      />
      <a
        className="absolute bottom-4 right-4"
        href={props.linkURL}
        target={"_blank"}
        rel={"noreferrer noopener"}
      >
        <Button className="rounded-full">
          <TbClick />
          <span className="ml-2">{props.linkTitle}</span>
        </Button>
      </a>
    </div>
  )
}
