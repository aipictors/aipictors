"use client"

import { AppMarkdown } from "@/components/app/app-markdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ImageModelsQuery } from "@/graphql/__generated__/graphql"

type Props = {
  markdownText: string
  models: ImageModelsQuery["imageModels"]
}

export const GenerationDocument = (props: Props) => {
  return (
    <div className="overflow-hidden space-y-4 w-full">
      <AppMarkdown>{props.markdownText}</AppMarkdown>
      <div className="w-full overflow-auto">
        <Table className="min-w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>{"モデル"}</TableHead>
              <TableHead>{"参考可能作品"}</TableHead>
              <TableHead>{"SD"}</TableHead>
              <TableHead>{"テイスト"}</TableHead>
              <TableHead>{"ライセンス"}</TableHead>
              <TableHead>{"推奨プロンプト"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>{model.displayName}</TableCell>
                <TableCell>{}</TableCell>
                <TableCell>{}</TableCell>
                <TableCell>{model.style}</TableCell>
                <TableCell>{model.license}</TableCell>
                <TableCell>{model.prompts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
