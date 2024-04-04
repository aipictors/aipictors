import { AppPage } from "@/components/app/app-page"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
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
  const convertDateFormat = (dateStr: string) => {
    const dateObj = new Date(dateStr)
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    return `${year}/${month}/${day}`
  }

  const client = createClient()

  const resp = await client.query({
    query: milestonesQuery,
    variables: {
      repository: "aipictors",
    },
  })

  const milestones = resp.data.milestones

  const appResp = await client.query({
    query: milestonesQuery,
    variables: {
      repository: "app",
    },
  })

  const appMilestones = appResp.data.milestones

  return (
    <AppPage>
      <div className="flex flex-col gap-y-4">
        <h1 className="font-bold">{"開発予定"}</h1>
        <div className="relative flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-800">
          <div className="absolute top-6 left-4 h-16 w-16 rounded-lg font-bold text-sm text-white">
            {"Web版"}
          </div>
          <img
            className="h-full w-full object-cover"
            alt=""
            src="https://www.aipictors.com/wp-content/themes/AISite/images/milestone-web-back.webp"
          />
        </div>
        <h2 className="font-bold text-sm">{"Web - これから"}</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-28">{"バージョン"}</TableHead>
                <TableHead className="min-w-64">{"タイトル"}</TableHead>
                <TableHead className="min-w-80">{"開発内容"}</TableHead>
                <TableHead className="min-w-16">{"完了予定"}</TableHead>
                <TableHead className="min-w-32">{"GitHub"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map(
                (milestone) =>
                  !milestone.isDone && (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-bold">
                        {milestone.version}
                      </TableCell>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>
                        {milestone.dueDate
                          ? convertDateFormat(milestone.dueDate)
                          : "未定"}
                      </TableCell>
                      <TableCell>
                        <Link href={milestone.pageURL} target="_blank">
                          {"GitHubで確認"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ),
              )}
            </TableBody>
          </Table>
        </Card>
        <div className="py-2">
          <Separator />
        </div>
        <h2 className="font-bold text-sm">{"Web - リリース済み"}</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-28">{"バージョン"}</TableHead>
                <TableHead className="min-w-64">{"タイトル"}</TableHead>
                <TableHead className="min-w-80">{"開発内容"}</TableHead>
                <TableHead className="min-w-32">{"GitHub"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map(
                (milestone) =>
                  milestone.isDone && (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-bold">
                        {milestone.version}
                      </TableCell>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>
                        <Link href={milestone.pageURL} target="_blank">
                          {"GitHubで確認"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ),
              )}
            </TableBody>
          </Table>
        </Card>
        <div className="py-2">
          <Separator />
        </div>
        <div className="relative flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-800">
          <div className="absolute top-6 left-4 h-16 w-16 rounded-lg font-bold text-sm text-white">
            {"アプリ版"}
          </div>
          <img
            className="h-full w-full object-cover"
            alt=""
            src="https://www.aipictors.com/wp-content/themes/AISite/images/milestone-app-back.webp"
          />
        </div>
        <h2 className="font-bold text-sm">{"アプリ - これから"}</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-28">{"バージョン"}</TableHead>
                <TableHead className="min-w-64">{"タイトル"}</TableHead>
                <TableHead className="min-w-80">{"開発内容"}</TableHead>
                <TableHead className="min-w-16">{"完了予定"}</TableHead>
                <TableHead className="min-w-32">{"GitHub"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appMilestones.map(
                (milestone) =>
                  !milestone.isDone && (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-bold">
                        {milestone.version}
                      </TableCell>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>
                        {milestone.dueDate
                          ? convertDateFormat(milestone.dueDate)
                          : "未定"}
                      </TableCell>
                      <TableCell>
                        <Link href={milestone.pageURL} target="_blank">
                          {"GitHubで確認"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ),
              )}
            </TableBody>
          </Table>
        </Card>
        <div className="py-2">
          <Separator />
        </div>
        <h2 className="font-bold text-sm">{"アプリ - リリース済み"}</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-28">{"バージョン"}</TableHead>
                <TableHead className="min-w-64">{"タイトル"}</TableHead>
                <TableHead className="min-w-80">{"開発内容"}</TableHead>
                <TableHead className="min-w-32">{"GitHub"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appMilestones.map(
                (milestone) =>
                  milestone.isDone && (
                    <TableRow key={milestone.id}>
                      <TableCell className="font-bold">
                        {milestone.version}
                      </TableCell>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>
                        <Link href={milestone.pageURL} target="_blank">
                          {"GitHubで確認"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ),
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppPage>
  )
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: { absolute: "開発予定" },
  }
}

export default MilestonesPage
