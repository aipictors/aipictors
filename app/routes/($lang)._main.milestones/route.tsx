import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Card } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { loaderClient } from "~/lib/loader-client"
import { Link, type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"
import type { LoaderFunctionArgs } from "react-router-dom"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MILESTONES, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const resp = await loaderClient.query({
    query: milestonesQuery,
    variables: {
      repository: "aipictors",
    },
  })

  const milestones = resp.data.milestones

  const appResp = await loaderClient.query({
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

export default function Milestone () {
  const data = useLoaderData<typeof loader>()

  if (data == null) {
    return null
  }

  const convertDateFormat = (dateStr: string) => {
    const dateObj = new Date(dateStr)
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    return `${year}/${month}/${day}`
  }

  const t = useTranslation()

  return (
    <>
      <h1 className="font-bold">{t("開発予定", "Development Milestones")}</h1>
      <Tabs defaultValue="web" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="web">{t("Web版", "Web Version")}</TabsTrigger>
          <TabsTrigger value="app">{t("App版", "App Version")}</TabsTrigger>
        </TabsList>
        <TabsContent value="web" className="w-full">
          <div className="flex flex-col gap-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-28">
                      {t("バージョン", "Version")}
                    </TableHead>
                    <TableHead className="min-w-64">
                      {t("タイトル", "Title")}
                    </TableHead>
                    <TableHead className="min-w-80">
                      {t("開発内容", "Development Details")}
                    </TableHead>
                    <TableHead className="min-w-16">
                      {t("完了予定", "Estimated Completion")}
                    </TableHead>
                    <TableHead className="min-w-32">
                      {t("GitHub", "GitHub")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.milestones.map((milestone, _index) => {
                    return (
                      <TableRow
                        key={milestone.id}
                        className={milestone.isDone ? "hidden" : ""}
                      >
                        <TableCell className="font-bold">
                          {milestone.version}
                        </TableCell>
                        <TableCell>{milestone.title}</TableCell>
                        <TableCell>{milestone.description}</TableCell>
                        <TableCell>
                          {milestone.dueDate
                            ? convertDateFormat(milestone.dueDate)
                            : t("未定", "TBD")}
                        </TableCell>
                        <TableCell key={`link-${milestone.id}`}>
                          <Link
                            key={`link-${milestone.id}`}
                            to={milestone.pageURL}
                            target="_blank"
                          >
                            {t("GitHubで確認", "Check on GitHub")}
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
            <div className="py-2">
              <Separator />
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <h2 className="font-bold text-sm">
                    {t("リリース済み", "Released")}
                  </h2>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-28">
                            {t("バージョン", "Version")}
                          </TableHead>
                          <TableHead className="min-w-64">
                            {t("タイトル", "Title")}
                          </TableHead>
                          <TableHead className="min-w-80">
                            {t("開発内容", "Development Details")}
                          </TableHead>
                          <TableHead className="min-w-32">
                            {t("GitHub", "GitHub")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.milestones.map((milestone) => (
                          <TableRow
                            key={milestone.id}
                            className={!milestone.isDone ? "hidden" : ""}
                          >
                            <TableCell className="font-bold">
                              {milestone.version}
                            </TableCell>
                            <TableCell>{milestone.title}</TableCell>
                            <TableCell>{milestone.description}</TableCell>
                            <TableCell>
                              <Link to={milestone.pageURL} target="_blank">
                                {t("GitHubで確認", "Check on GitHub")}
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
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
                  alt={t("download", "download")}
                  className="h-12"
                />
              </Link>
              <Link to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja">
                <img
                  src="/google/download.png"
                  alt={t("download", "download")}
                  className="h-16"
                />
              </Link>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-28">
                      {t("バージョン", "Version")}
                    </TableHead>
                    <TableHead className="min-w-64">
                      {t("タイトル", "Title")}
                    </TableHead>
                    <TableHead className="min-w-80">
                      {t("開発内容", "Development Details")}
                    </TableHead>
                    <TableHead className="min-w-16">
                      {t("完了予定", "Estimated Completion")}
                    </TableHead>
                    <TableHead className="min-w-32">
                      {t("GitHub", "GitHub")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.appMilestones.map((milestone) => (
                    <TableRow
                      key={milestone.id}
                      className={milestone.isDone ? "hidden" : ""}
                    >
                      <TableCell className="font-bold">
                        {milestone.version}
                      </TableCell>
                      <TableCell>{milestone.title}</TableCell>
                      <TableCell>{milestone.description}</TableCell>
                      <TableCell>
                        {milestone.dueDate
                          ? convertDateFormat(milestone.dueDate)
                          : t("未定", "TBD")}
                      </TableCell>
                      <TableCell>
                        <Link to={milestone.pageURL} target="_blank">
                          {t("GitHubで確認", "Check on GitHub")}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <div className="py-2">
              <Separator />
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <h2 className="font-bold text-sm">
                    {t("リリース済み", "Released")}
                  </h2>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-28">
                            {t("バージョン", "Version")}
                          </TableHead>
                          <TableHead className="min-w-64">
                            {t("タイトル", "Title")}
                          </TableHead>
                          <TableHead className="min-w-80">
                            {t("開発内容", "Development Details")}
                          </TableHead>
                          <TableHead className="min-w-32">
                            {t("GitHub", "GitHub")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.appMilestones.map((milestone) => (
                          <TableRow
                            key={milestone.id}
                            className={!milestone.isDone ? "hidden" : ""}
                          >
                            <TableCell className="font-bold">
                              {milestone.version}
                            </TableCell>
                            <TableCell>{milestone.title}</TableCell>
                            <TableCell>{milestone.description}</TableCell>
                            <TableCell>
                              <Link to={milestone.pageURL} target="_blank">
                                {t("GitHubで確認", "Check on GitHub")}
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

const milestonesQuery = graphql(
  `query Milestones($repository: String!) {
    milestones(where: {repository: $repository}) {
      id
      title
      version
      description
      pageURL
      isDone
      dueDate
    }
  }`,
)
