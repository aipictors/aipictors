import type { FragmentOf } from "gql.tada"
import {
  ThemeArticle,
  type ThemeWorkFragment,
} from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"

type Props = {
  works: FragmentOf<typeof ThemeWorkFragment>[]
  worksCount: number
  firstWork: FragmentOf<typeof ThemeWorkFragment> | null
  isSensitive: boolean
  title: string
  year: number
  month: number
  day: number
  page: number
  themeId: string
}

export function ThemeArticleContainer(props: Props) {
  return (
    <article>
      <ThemeArticle
        works={props.works}
        worksCount={props.worksCount}
        firstWork={props.firstWork}
        title={props.title}
        year={props.year}
        month={props.month}
        day={props.day}
        isSensitive={props.isSensitive}
        page={props.page}
        themeId={props.themeId}
      />
    </article>
  )
}
