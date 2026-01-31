import type { FragmentOf } from "gql.tada"
import { SensitiveThemeArticle } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/sensitive-theme-article"
import type { ThemeWorkFragment } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import type { ThemeListItemFragment } from "~/routes/($lang)._main.themes._index/components/theme-list"

type Props = {
  works: FragmentOf<typeof ThemeWorkFragment>[]
  worksCount: number
  firstWork: FragmentOf<typeof ThemeWorkFragment> | null
  title: string
  year: number
  month: number
  day: number
  page: number
  themeId: string
  dailyThemes: FragmentOf<typeof ThemeListItemFragment>[]
  dailyBeforeThemes: FragmentOf<typeof ThemeListItemFragment>[]
}

export function SensitiveThemeArticleContainer (props: Props) {
  return (
    <article>
      <SensitiveThemeArticle
        works={props.works}
        worksCount={props.worksCount}
        firstWork={props.firstWork}
        title={props.title}
        year={props.year}
        month={props.month}
        day={props.day}
        page={props.page}
        themeId={props.themeId}
        dailyThemes={props.dailyThemes}
        dailyBeforeThemes={props.dailyBeforeThemes}
      />
    </article>
  )
}
