import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "~/components/ui/hover-card"
import { toOmissionNumberText } from "~/utils/to-omission-number-text"

type Props = {
  number: number
}

/**
 * 省略数字
 */
export const OmissionNumber = (props: Props) => {
  return (
    <HoverCard>
      <HoverCardTrigger>{toOmissionNumberText(props.number)}</HoverCardTrigger>
      <HoverCardContent className="w-auto">{props.number}</HoverCardContent>
    </HoverCard>
  )
}
