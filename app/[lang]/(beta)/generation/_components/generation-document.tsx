"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ImageModelsQuery } from "@/graphql/__generated__/graphql"
import { CheckIcon } from "lucide-react"

type Props = {
  models: ImageModelsQuery["imageModels"]
}

export const GenerationDocument = (props: Props) => {
  const imageUrl =
    "https://www.aipictors.com/wp-content/themes/AISite/images/banner/aipictors-plus-banner.webp"

  return (
    <div className="overflow-hidden px-4 space-y-4 w-full">
      <img className="rounded w-full" src={imageUrl} alt="Aipictors Plus" />
      <div>
        <p>{"投稿時は規約をご確認ください。"}</p>
        <p>{"複数アカウントでの生成は禁止です。"}</p>
        <ul className="list-disc">
          <li>{"赤十字マークは作品に含めないようご注意下さい。"}</li>
          <li>
            {
              "法的な観点より性器または性器を連想する部位、性器結合部位及び挿入部位、アヌス結合部位及び挿入部位の無修正画像（AIにより当該部位に修正がされたものを含む）の生成、投稿（モザイク加工を行っている作品も含む）はお控え下さい。"
            }
          </li>
          <li>
            {
              "複数アカウントでの生成、無修正画像の生成、児童ポルノと誤認される恐れのある画像の生成は禁止されています。"
            }
          </li>
          <li>
            {
              "生成された画像の投稿時には意図的に極端に破綻した作品の投稿は禁止されています。"
            }
          </li>
          <li>
            {
              "意図的な規約違反が検出された場合は生成機能がご利用いただけなくなります。"
            }
          </li>
        </ul>
        <ul>
          <li>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              {"すべてのモデルについて個人利用可です。"}
            </div>
          </li>
          <li>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              {"すべてのモデルについて商業利用可です。"}
            </div>
          </li>
        </ul>
        <p>
          {
            "Aipictors生成機で生成された旨の記載は可能であれば記載いただけると嬉しいです。"
          }
        </p>
      </div>
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
