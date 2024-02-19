import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { IconType } from "react-icons"

type Props = {
  icon?: LucideIcon | IconType
  onClick?(): void
  title?: string
  className?: string
  text?: string
  disabled?: boolean
}

export const GenerationMenuButton = (props: Props) => {
  return (
    <Button
      title={props.title}
      variant={"secondary"}
      onClick={props.onClick}
      disabled={props.disabled}
      size={"sm"}
      className={`${props.className} pad-0`}
    >
      <div className="pad-8">
        {props.icon && <props.icon className="m-auto w-4 h-4" />}
      </div>
      {props.text && <p className="ml-1">{props.text}</p>}
    </Button>
  )
}
