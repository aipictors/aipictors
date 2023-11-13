import type { EventUserType } from "@/app/[lang]/events/_types/event-user-type"
import { TbFlame, TbPhoto, TbShoppingBag } from "react-icons/tb"

type Props = {
  type: EventUserType
}

export const EventUserTag: React.FC<Props> = (props) => {
  if (props.type === "SPONSOR") {
    return (
      <div className="flex items-center">
        <TbFlame />
        <span className="pl-1 font-bold">{"スポンサー"}</span>
      </div>
    )
  }

  if (props.type === "EXHIBIT") {
    return (
      <div className="flex items-center">
        <TbPhoto />
        <span className="pl-1 font-bold">{"展示"}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <TbShoppingBag />
      <span className="pl-1 font-bold">{"出展"}</span>
    </div>
  )
}
