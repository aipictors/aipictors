import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/_components/ui/table"
import type { WorkAccessType } from "@/_types/work-access-type"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import { PencilIcon } from "lucide-react"
// import { PencilIcon } from "lucide-react"
import React from "react"

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
    accessType: WorkAccessType
    isTagEditable: boolean
  }[]
}

/**
 * 作品一覧
 */
export const WorksList = (props: Props) => {
  const [page, setPage] = React.useState(0)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>{}</TableHead>
            <TableHead>{}</TableHead>
            <TableHead>いいね！</TableHead>
            <TableHead>ブックマーク</TableHead>
            <TableHead>コメント</TableHead>
            <TableHead>閲覧</TableHead>
            <TableHead>状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.works.map((work, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="w-32">{work.title}</div>
              </TableCell>
              <TableCell>
                <img
                  src={work.thumbnailImageUrl}
                  alt=""
                  className="h-[80px] w-[80px] rounded-md object-cover"
                />{" "}
              </TableCell>
              <TableCell>
                <a href={`https://aipictors.com/edit-work/?id=${work.id}`}>
                  <PencilIcon />
                </a>
              </TableCell>
              <TableCell>{work.likesCount}</TableCell>
              <TableCell>
                {<div className="w-8">{work.bookmarksCount}</div>}
              </TableCell>
              <TableCell>{work.commentsCount}</TableCell>
              <TableCell>{work.viewsCount}</TableCell>
              <TableCell>{toAccessTypeText(work.accessType)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
