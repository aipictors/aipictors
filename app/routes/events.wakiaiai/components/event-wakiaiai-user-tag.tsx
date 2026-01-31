import type { EventUserType } from "~/routes/events.wakiaiai/types/event-user-type"
import { FlameIcon, ImageIcon, ShoppingBagIcon } from "lucide-react"

type Props = {
  type: EventUserType
}

export function EventWakiaiaiUserTag (props: Props) {
  if (props.type === "SPONSOR") {
    return (
      <div className="flex items-center">
        <FlameIcon />
        <span className="pl-1 font-bold">{"スポンサー"}</span>
      </div>
    )
  }

  if (props.type === "EXHIBIT") {
    return (
      <div className="flex items-center">
        <ImageIcon />
        <span className="pl-1 font-bold">{"展示"}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <ShoppingBagIcon />
      <span className="pl-1 font-bold">{"出展"}</span>
    </div>
  )
}
