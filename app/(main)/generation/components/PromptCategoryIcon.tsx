import { Icon } from "@chakra-ui/react"
import { FC } from "react"
import {
  TbEye,
  TbFriends,
  TbFaceId,
  TbBrightnessUp,
  TbBrush,
  TbBuildingCarousel,
  TbMoodBoy,
  TbShirt,
  TbDog,
} from "react-icons/tb"

type Props = { name: string }

export const PromptCategoryIcon: FC<Props> = (props) => {
  const categoryIcons = {
    キャラクター: TbFaceId,
    髪型: TbMoodBoy,
    服装: TbShirt,
    髪色: TbMoodBoy,
    目: TbEye,
    属性: TbFriends,
    "テイスト・構図": TbBrush,
    主題: TbDog,
    "背景・天気": TbBrightnessUp,
    シチュエーション: TbBuildingCarousel,
  } as any

  return <Icon as={categoryIcons[props.name]} />
}
