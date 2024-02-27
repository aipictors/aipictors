import {
  BabyIcon,
  BookIcon,
  BrushIcon,
  CakeIcon,
  DogIcon,
  EyeIcon,
  ScanFaceIcon,
  SchoolIcon,
  ShirtIcon,
  SparklesIcon,
  SunMediumIcon,
} from "lucide-react"

type Props = { name: string }

export const PromptCategoryIcon = (props: Props) => {
  const categoryIcons = new Map([
    ["性別", ScanFaceIcon],
    ["二次創作", SparklesIcon],
    ["お題", BookIcon],
    ["髪型", BabyIcon],
    ["服装", ShirtIcon],
    ["髪色", BabyIcon],
    ["目", EyeIcon],
    ["属性", SchoolIcon],
    ["テイスト・構図", BrushIcon],
    ["主題", DogIcon],
    ["背景・天気", SunMediumIcon],
    ["シチュエーション", CakeIcon],
  ])

  const CategoryIcon = categoryIcons.get(props.name)

  if (CategoryIcon === undefined) {
    return undefined
  }

  return <CategoryIcon />
}
