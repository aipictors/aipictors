import { Tag, TagLeftIcon, TagLabel } from "@chakra-ui/react"
import { FC } from "react"
import { TbFlame, TbPhoto, TbShoppingBag } from "react-icons/tb"
import { EventUserType } from "app/events/types/eventUserType"

type Props = {
  type: EventUserType
}

export const TagEventUser: FC<Props> = (props) => {
  if (props.type === "SPONSOR") {
    return (
      <Tag colorScheme={"yellow"} borderRadius={"full"}>
        <TagLeftIcon fontSize={20} as={TbFlame} />
        <TagLabel fontWeight={"bold"}>{"スポンサー"}</TagLabel>
      </Tag>
    )
  }

  if (props.type === "EXHIBIT") {
    return (
      <Tag colorScheme={"blue"} borderRadius={"full"}>
        <TagLeftIcon fontSize={20} as={TbPhoto} />
        <TagLabel fontWeight={"bold"}>{"展示のみ"}</TagLabel>
      </Tag>
    )
  }

  return (
    <Tag colorScheme={"green"} borderRadius={"full"}>
      <TagLeftIcon fontSize={20} as={TbShoppingBag} />
      <TagLabel fontWeight={"bold"}>{"出展"}</TagLabel>
    </Tag>
  )
}
