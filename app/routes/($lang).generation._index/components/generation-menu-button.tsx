import { Button } from "@/components/ui/button"
import type { RemixiconComponentType } from "@remixicon/react"
import type { LucideIcon } from "lucide-react"
import { Loader2Icon } from "lucide-react"

type Props = {
  icon?: LucideIcon | RemixiconComponentType
  isLoading?: boolean
  onClick?(): void
  title?: string
  className?: string
  text?: string
  disabled?: boolean
}

export const GenerationMenuButton = (props: Props) => {
  return props.isLoading ? (
    <Button
      title={props.title}
      variant={"secondary"}
      onClick={() => {}}
      disabled={true}
      size={"sm"}
      className={`${props.className}pad-0`}
    >
      <Loader2Icon color="black" className={"m-auto h-4 w-4 animate-spin"} />
    </Button>
  ) : (
    <Button
      title={props.title}
      variant={"secondary"}
      onClick={props.onClick}
      disabled={props.disabled}
      size={"sm"}
      className={`${props.className}pad-0`}
    >
      <div className="pad-8">
        {props.icon && <props.icon className="m-auto h-4 w-4" />}
      </div>
      {props.text && <p className="ml-1">{props.text}</p>}
    </Button>
  )
}
