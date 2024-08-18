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

type Props = {
  works: FragmentOf<typeof RecommendedWorksTableItemFragment>[]
}

/**
 * 推薦作品一覧
 */
export function RecommendedWorksListTable(props: Props) {
  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>{"タイトル"}</TableHead>
              <TableHead>{""}</TableHead>
              <TableHead>{"いいね"}</TableHead>
              <TableHead>{"ブックマーク"}</TableHead>
              <TableHead>{"コメント"}</TableHead>
              <TableHead>{"閲覧"}</TableHead>
              <TableHead>{"状態"}</TableHead>
              <TableHead>{"日付"}</TableHead>
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
