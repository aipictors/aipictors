import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { IconType } from "react-icons"

type Props = {
  icon?: LucideIcon | IconType
  onClick?(): void
  title?: string
  className?: string
  text?: string
}

export const GenerationMenuButton = (props: Props) => {
  return (
    <Button
      title={props.title}
      variant={"ghost"}
      onClick={props.onClick}
      className={`${props.className} pad-0`}
    >
      <div className="pad-8">
        {props.icon && <props.icon className="m-auto w-4 h-4" />}
      </div>
      <p className="ml-1">{props.text}</p>
    </Button>
  )
}
