import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"
import { Link } from "@remix-run/react"
import { HelpCircleIcon } from "lucide-react"

type Props = {
  text: string
  detailLink?: string
  isTargetBlank?: boolean
}

/**
 * PCとスマホの両方で使えるホバーカード
 */
export const CrossPlatformTooltip = (props: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <HelpCircleIcon className="w-4" />
      </PopoverTrigger>
      <PopoverContent className="whitespace-pre-wrap font-size-md">
        {props.text}
        {props.detailLink && <Link to={props.detailLink}>{"(詳細)"}</Link>}
      </PopoverContent>
    </Popover>
  )
}
