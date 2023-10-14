import { Icon } from "@chakra-ui/react"
import {
  TbBrightnessUp,
  TbBrush,
  TbBuildingCarousel,
  TbDog,
  TbEye,
  TbFaceId,
  TbFriends,
  TbMoodBoy,
  TbShirt,
} from "react-icons/tb"

type Props = { name: string }

export const PromptCategoryIcon: React.FC<Props> = (props) => {
  const categoryIcons = new Map([
    ["キャラクター", TbFaceId],
    ["髪型", TbMoodBoy],
    ["服装", TbShirt],
    ["髪色", TbMoodBoy],
    ["目", TbEye],
    ["属性", TbFriends],
    ["テイスト・構図", TbBrush],
    ["主題", TbDog],
    ["背景・天気", TbBrightnessUp],
    ["シチュエーション", TbBuildingCarousel],
  ])

  const categoryIcon = categoryIcons.get(props.name)

  if (categoryIcon === undefined) {
    return <Icon as={undefined} />
  }

  return <Icon as={categoryIcon} />
}
