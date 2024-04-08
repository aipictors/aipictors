import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/_components/app/app-markdown"
import { AppPage } from "@/_components/app/app-page"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_components/ui/table"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const text = await readFile(
    join(process.cwd(), "assets/specified-commercial-transaction-act.md"),
    "utf-8",
  )

  const company = [
    {
      title: "商号",
      content: "Aipictors株式会社",
      enContent: "AIPICTORS K.K.",
    },
    {
      title: "住所",
      content: "大阪府大阪市北区梅田１丁目２番２号大阪駅前第２ビル１２－１２",
      enContent: "1-2-2 Osaka Station Building 2 12-12 Umeda Kita-ku",
    },
    {
      title: "代表取締役",
      content: "中塚季利人",
      enContent: "KIRITO NAKATSUKA",
    },
  ]

  return {
    text,
    company,
  }
}

export default function SpecifiedCommercialTransactionActPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <article>
        <h1 className="py-4 font-bold text-xl">{"特定商取引法に基づく表記"}</h1>
        <h2 className="py-4 font-bold text-md">会社情報</h2>
        <Table>
          <TableCaption>会社情報</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[96px]">タイトル</TableHead>
              <TableHead>Japanese</TableHead>
              <TableHead>English</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.company.map((item) => (
              <TableRow key={null}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.content}</TableCell>
                <TableCell>{item.enContent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h2 className="py-4 font-bold text-md">事業内容</h2>
        <h3 className="py-4">コンテンツプラットフォーム</h3>
        <p>
          「Aipictors」 AIコンテンツに出会えるプラットフォームを提供しています。
          新しいクリエイター、ユーザとのコミュニケーションを支えます。
        </p>
        <h2 className="py-4 font-bold text-md">特定商取引法に基づく表記</h2>
        <AppMarkdown>{data.text}</AppMarkdown>
      </article>
    </AppPage>
  )
}
