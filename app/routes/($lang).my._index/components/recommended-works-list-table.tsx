import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "~/components/ui/table"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  RecommendedWorksListTableRow,
  RecommendedWorksTableRowFragment,
} from "~/routes/($lang).my._index/components/recommended-works-list-table-row"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof RecommendedWorksTableItemFragment>[]
}

/**
 * 推薦作品一覧
 */
export function RecommendedWorksListTable (props: Props) {
  const t = useTranslation()

  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>{t("タイトル", "Title")}</TableHead>
              <TableHead>{""}</TableHead>
              <TableHead>{t("いいね", "Likes")}</TableHead>
              <TableHead>{t("ブックマーク", "Bookmarks")}</TableHead>
              <TableHead>{t("コメント", "Comments")}</TableHead>
              <TableHead>{t("閲覧", "Views")}</TableHead>
              <TableHead>{t("状態", "Status")}</TableHead>
              <TableHead>{t("日付", "Date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.works.map((work) => (
              <RecommendedWorksListTableRow work={work} key={work.id} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}

export const RecommendedWorksTableItemFragment = graphql(
  `fragment RecommendedWorksTableItem on WorkNode @_unmask {
    ...RecommendedWorksTableRow
  }`,
  [RecommendedWorksTableRowFragment],
)
