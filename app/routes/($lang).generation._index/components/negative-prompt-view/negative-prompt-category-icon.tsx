import {
  BookTextIcon,
  CaseUpperIcon,
  HandIcon,
  PersonStandingIcon,
} from "lucide-react"

type Props = { name: string }

export function NegativePromptCategoryIcon (props: Props) {
  const categoryIcons = new Map([
    ["汎用", BookTextIcon],
    ["手の崩れ予防", HandIcon],
    ["人物を取り除く", PersonStandingIcon],
    ["ロゴやテキストを取り除く", CaseUpperIcon],
  ])

  const CategoryIcon = categoryIcons.get(props.name)

  if (CategoryIcon === undefined) {
    return undefined
  }

  return <CategoryIcon />
}
