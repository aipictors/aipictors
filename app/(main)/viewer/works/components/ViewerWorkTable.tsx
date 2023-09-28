"use client"
import { TableContainer, Table, Thead, Tr, Th, Tbody } from "@chakra-ui/react"
import { ViewerWorkTableItem } from "app/(main)/viewer/works/components/ViewerWorkTableItem"

export const ViewerWorkTable: React.FC = () => {
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
