import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/_components/ui/table"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { RecommendedWorksListTableRow } from "@/routes/($lang).dashboard._index/_components/recommended-works-list-table-row"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    accessType: IntrospectionEnum<"AccessType">
    isTagEditable: boolean
  }[]
}

/**
 * ブックマーク作品一覧
 */
export const BookmarkWorksListTable = (props: Props) => {
  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>{"タイトル"}</TableHead>
              <TableHead>{}</TableHead>
              <TableHead>{"いいね"}</TableHead>
              <TableHead>{"ブックマーク"}</TableHead>
              <TableHead>{"コメント"}</TableHead>
              <TableHead>{"閲覧"}</TableHead>
              <TableHead>{"状態"}</TableHead>
              <TableHead>{"日付"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.works.map((work, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <RecommendedWorksListTableRow work={work} key={index} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}
