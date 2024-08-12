import type { FragmentOf } from "gql.tada"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { ThemeArticle } from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  worksCount: number
  firstWork: FragmentOf<typeof partialWorkFieldsFragment> | null
  isSensitive: boolean
  title: string
  year: number
  month: number
  day: number
  page: number
  themeId: string
}

export const ThemeArticleContainer = (props: Props) => {
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
