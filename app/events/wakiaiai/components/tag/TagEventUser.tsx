import { Tag, TagLeftIcon, TagLabel } from "@chakra-ui/react"
import { TbFlame, TbPhoto, TbShoppingBag } from "react-icons/tb"
import type { EventUserType } from "app/events/types/eventUserType"

type Props = {
  type: EventUserType
}

export const TagEventUser: React.FC<Props> = (props) => {
  if (props.type === "SPONSOR") {
    return (
      <Tag colorScheme={"yellow"} borderRadius={"full"} w={"fit-content"}>
        <TagLeftIcon fontSize={20} as={TbFlame} mr={1} />
        <TagLabel fontWeight={"bold"} lineHeight={1}>
          {"スポンサー"}
        </TagLabel>
      </Tag>
    )
  }

  if (props.type === "EXHIBIT") {
    return (
      <Tag colorScheme={"blue"} borderRadius={"full"} w={"fit-content"}>
        <TagLeftIcon fontSize={20} as={TbPhoto} mr={1} />
        <TagLabel fontWeight={"bold"} lineHeight={1}>
          {"展示"}
        </TagLabel>
      </Tag>
    )
  }

  return (
    <Tag colorScheme={"green"} borderRadius={"full"} w={"fit-content"}>
      <TagLeftIcon fontSize={20} as={TbShoppingBag} mr={1} />
      <TagLabel fontWeight={"bold"} lineHeight={1}>
        {"出展"}
      </TagLabel>
    </Tag>
  )
}
