"use client"

import { ViewerWorkTableItem } from "@/app/[lang]/(main)/my/works/_components/viewer-work-table-item"
import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react"

export const ViewerWorkTable = () => {
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>{"サムネイル"}</Th>
            <Th>{"作品名"}</Th>
            <Th>{"形式"}</Th>
            <Th>{"編集"}</Th>
            <Th>{"削除"}</Th>
            <Th>{"いいね"}</Th>
            <Th>{"閲覧"}</Th>
            <Th>{"コメント"}</Th>
            <Th>{"対象"}</Th>
            <Th>{"状態"}</Th>
            <Th>{"予約"}</Th>
            <Th>{"プロンプト"}</Th>
            <Th>{"投稿日付"}</Th>
          </Tr>
        </Thead>
        <Tbody>
          <ViewerWorkTableItem />
          <ViewerWorkTableItem />
          <ViewerWorkTableItem />
        </Tbody>
      </Table>
    </TableContainer>
  )
}
