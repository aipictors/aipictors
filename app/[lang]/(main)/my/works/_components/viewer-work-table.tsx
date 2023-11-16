"use client"

import { ViewerWorkTableItem } from "@/app/[lang]/(main)/my/works/_components/viewer-work-table-item"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const ViewerWorkTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{"サムネイル"}</TableHead>
          <TableHead>{"作品名"}</TableHead>
          <TableHead>{"形式"}</TableHead>
          <TableHead>{"編集"}</TableHead>
          <TableHead>{"削除"}</TableHead>
          <TableHead>{"いいね"}</TableHead>
          <TableHead>{"閲覧"}</TableHead>
          <TableHead>{"コメント"}</TableHead>
          <TableHead>{"対象"}</TableHead>
          <TableHead>{"状態"}</TableHead>
          <TableHead>{"予約"}</TableHead>
          <TableHead>{"プロンプト"}</TableHead>
          <TableHead>{"投稿日付"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <ViewerWorkTableItem />
        <ViewerWorkTableItem />
        <ViewerWorkTableItem />
      </TableBody>
    </Table>
  )
}
