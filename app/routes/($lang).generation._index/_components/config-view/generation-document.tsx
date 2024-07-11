import { AppMarkdown } from "@/_components/app/app-markdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_components/ui/table"
import { graphql, type ResultOf } from "gql.tada"

type Props = {
  markdownText: string
  models: ResultOf<typeof imageModelsQuery>["imageModels"]
}

export const GenerationDocument = (props: Props) => {
  return (
    <div className="w-full space-y-4 overflow-hidden">
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

export const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      id
      name
      displayName
      category
      description
      license
      prompts
      slug
      style
      thumbnailImageURL
      type
    }
  }`,
)
