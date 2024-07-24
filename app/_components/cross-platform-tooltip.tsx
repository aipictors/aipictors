import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/_components/ui/hover-card"
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
export const CrossPlatformHoverCard = (props: Props) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <HelpCircleIcon className="w-4" />
      </HoverCardTrigger>
      <HoverCardContent className="whitespace-pre-wrap font-size-md">
        {props.text}
        {props.detailLink && !props.isTargetBlank && (
          <Link to={props.detailLink}>{"(詳細)"}</Link>
        )}
        {props.detailLink && props.isTargetBlank === true && (
          <Link to={props.detailLink} rel="noopener noreferrer" target="_blank">
            {"(詳細)"}
          </Link>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
