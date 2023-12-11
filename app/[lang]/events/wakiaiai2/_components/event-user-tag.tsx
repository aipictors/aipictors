import type { EventUserType } from "@/app/[lang]/events/_types/event-user-type"
import { Flame, Image, ShoppingBag } from "lucide-react"

type Props = {
  type: EventUserType
}

export const EventUserTag = (props: Props) => {
  if (props.type === "SPONSOR") {
    return (
      <div className="flex items-center">
        <Flame />
        <span className="pl-1 font-bold">{"スポンサー"}</span>
      </div>
    )
  }

  if (props.type === "EXHIBIT") {
    return (
      <div className="flex items-center">
        <Image />
        <span className="pl-1 font-bold">{"展示"}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <ShoppingBag />
      <span className="pl-1 font-bold">{"出展"}</span>
    </div>
  )
}
