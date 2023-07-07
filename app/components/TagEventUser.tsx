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
      <Tag colorScheme={"yellow"} borderRadius={"full"} w={"fit-content"}>
        <TagLeftIcon fontSize={20} as={TbFlame} />
        <TagLabel fontWeight={"bold"} lineHeight={1}>
          {"スポンサ"}
        </TagLabel>
      </Tag>
    )
  }

  if (props.type === "EXHIBIT") {
    return (
      <Tag colorScheme={"blue"} borderRadius={"full"} w={"fit-content"}>
        <TagLeftIcon fontSize={20} as={TbPhoto} />
        <TagLabel fontWeight={"bold"} lineHeight={1}>
          {"展示"}
        </TagLabel>
      </Tag>
    )
  }

  return (
    <Tag colorScheme={"green"} borderRadius={"full"} w={"fit-content"}>
      <TagLeftIcon fontSize={20} as={TbShoppingBag} />
      <TagLabel fontWeight={"bold"} lineHeight={1}>
        {"出展"}
      </TagLabel>
    </Tag>
  )
}
