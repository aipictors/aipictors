import { Icon } from "@chakra-ui/react"
import {
  Baby,
  Brush,
  Cake,
  Dog,
  Eye,
  ScanFace,
  School,
  Shirt,
  SunMedium,
} from "lucide-react"

type Props = { name: string }

export const PromptCategoryIcon = (props: Props) => {
  const categoryIcons = new Map([
    ["キャラクター", ScanFace],
    ["髪型", Baby],
    ["服装", Shirt],
    ["髪色", Baby],
    ["目", Eye],
    ["属性", School],
    ["テイスト・構図", Brush],
    ["主題", Dog],
    ["背景・天気", SunMedium],
    ["シチュエーション", Cake],
  ])

  const CategoryIcon = categoryIcons.get(props.name)

  if (CategoryIcon === undefined) {
    return <Icon as={undefined} />
  }

  return <CategoryIcon />
}
