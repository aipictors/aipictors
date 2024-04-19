import { AppPage } from "@/_components/app/app-page"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Card } from "@/_components/ui/card"
import { Separator } from "@/_components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { milestonesQuery } from "@/_graphql/queries/milestone/miestones"
import { createClient } from "@/_lib/client"
import { Link, useLoaderData } from "@remix-run/react"

export async function loader() {
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

  return {
    milestones,
    appMilestones,
  }
}

export default function Milestone() {
  const data = useLoaderData<typeof loader>()

  const convertDateFormat = (dateStr: string) => {
    const dateObj = new Date(dateStr)
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    return `${year}/${month}/${day}`
  }

  return (
    <AppPage>
      <h1 className="font-bold">{"開発予定"}</h1>
      <Tabs defaultValue="web" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="web">Web版</TabsTrigger>
          <TabsTrigger value="app">App版</TabsTrigger>
        </TabsList>
        <TabsContent value="web" className="w-full">
          <div className="flex flex-col gap-y-4">
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
                  {data.milestones.map(
                    (milestone) =>
                      // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
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
                            <Link to={milestone.pageURL} target="_blank">
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
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <h2 className="font-bold text-sm">{"リリース済み"}</h2>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-28">
                            {"バージョン"}
                          </TableHead>
                          <TableHead className="min-w-64">
                            {"タイトル"}
                          </TableHead>
                          <TableHead className="min-w-80">
                            {"開発内容"}
                          </TableHead>
                          <TableHead className="min-w-32">{"GitHub"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.milestones.map(
                          (milestone) =>
                            // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
                            milestone.isDone && (
                              <TableRow key={milestone.id}>
                                <TableCell className="font-bold">
                                  {milestone.version}
                                </TableCell>
                                <TableCell>{milestone.title}</TableCell>
                                <TableCell>{milestone.description}</TableCell>
                                <TableCell>
                                  <Link to={milestone.pageURL} target="_blank">
                                    {"GitHubで確認"}
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ),
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
        <TabsContent value="app" className="w-full">
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-start space-x-8">
              <Link to="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636">
                <img
                  src="/apple/download.svg"
                  alt="download"
                  className="h-12"
                />
              </Link>
              <Link to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja">
                <img
                  src="/google/download.png"
                  alt="download"
                  className="h-16"
                />
              </Link>
            </div>
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
                  {data.appMilestones.map(
                    (milestone) =>
                      // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
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
                            <Link to={milestone.pageURL} target="_blank">
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
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <h2 className="font-bold text-sm">{"リリース済み"}</h2>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-28">
                            {"バージョン"}
                          </TableHead>
                          <TableHead className="min-w-64">
                            {"タイトル"}
                          </TableHead>
                          <TableHead className="min-w-80">
                            {"開発内容"}
                          </TableHead>
                          <TableHead className="min-w-32">{"GitHub"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.appMilestones.map(
                          (milestone) =>
                            // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
                            milestone.isDone && (
                              <TableRow key={milestone.id}>
                                <TableCell className="font-bold">
                                  {milestone.version}
                                </TableCell>
                                <TableCell>{milestone.title}</TableCell>
                                <TableCell>{milestone.description}</TableCell>
                                <TableCell>
                                  <Link to={milestone.pageURL} target="_blank">
                                    {"GitHubで確認"}
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ),
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </AppPage>
  )
}
