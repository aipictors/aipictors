import { AppPage } from "@/components/app/app-page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { milestonesQuery } from "@/graphql/queries/milestone/miestones"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"
import Link from "next/link"

/**
 * マイルストーン
 * @returns
 */
const MilestonesPage = async () => {
  const client = createClient()

  const resp = await client.query({
    query: milestonesQuery,
    variables: {
      repository: "aipictors",
    },
  })

  const milestones = resp.data.milestones

  return (
    <AppPage>
      <h1 className="font-bold">{"開発予定"}</h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-28">{"バージョン"}</TableHead>
              <TableHead className="min-w-64">{"タイトル"}</TableHead>
              <TableHead className="min-w-80">{"開発内容"}</TableHead>
              <TableHead className="min-w-16">{"状態"}</TableHead>
              <TableHead className="min-w-32">{"GitHub"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.map((milestone) => (
              <TableRow key={milestone.id}>
                <TableCell className="font-bold">{milestone.version}</TableCell>
                <TableCell>{milestone.title}</TableCell>
                <TableCell>{milestone.description}</TableCell>
                <TableCell>{milestone.isDone ? "完了" : "予定"}</TableCell>
                <TableCell>
                  <Link href={milestone.pageURL} target="_blank">
                    {"GitHubで確認"}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppPage>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "開発予定" },
  }
}

export const revalidate = 0

export default MilestonesPage
