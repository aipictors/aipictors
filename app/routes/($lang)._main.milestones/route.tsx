import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { graphql, type ResultOf } from "gql.tada"
import { CalendarDaysIcon, CheckIcon, ExternalLinkIcon } from "lucide-react"
import { PictorChanSays } from "~/components/pictor-chan-says"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"
import type { LoaderFunctionArgs } from "react-router-dom"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MILESTONES, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const [resp, appResp] = await Promise.all([
    loaderClient.query({
      query: milestonesQuery,
      variables: {
        repository: "aipictors",
      },
    }),
    loaderClient.query({
      query: milestonesQuery,
      variables: {
        repository: "app",
      },
    }),
  ])

  return {
    milestones: resp.data.milestones,
    appMilestones: appResp.data.milestones,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

type Milestone = ResultOf<typeof milestonesQuery>["milestones"][number]

const formatDueDate = (dateText: string) => {
  // サーバーとブラウザで日付がずれないよう、日本時間で出す
  return new Date(dateText).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
}

function MilestoneItem (props: { milestone: Milestone }) {
  const t = useTranslation()
  const { milestone } = props

  return (
    <li className="relative pb-3 pl-7 last:pb-0">
      {/* 道のりの線と点 */}
      <span
        aria-hidden="true"
        className="absolute top-5 bottom-[-0.25rem] left-[0.6875rem] w-px bg-border group-last/list:hidden"
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-4 left-0 flex size-6 items-center justify-center rounded-full border-2 bg-background",
          milestone.isDone ? "border-emerald-500" : "border-primary",
        )}
      >
        {milestone.isDone ? (
          <CheckIcon className="size-3.5 text-emerald-500" />
        ) : (
          <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />
        )}
      </span>
      <div className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono font-semibold text-xs">
            {milestone.version}
          </span>
          {!milestone.isDone && (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <CalendarDaysIcon aria-hidden="true" className="size-3.5" />
              {t("完了予定", "Estimated")}{" "}
              {milestone.dueDate
                ? formatDueDate(milestone.dueDate)
                : t("未定", "TBD")}
            </span>
          )}
        </div>
        <h3 className="mt-2 font-bold">{milestone.title}</h3>
        {milestone.description !== "" && milestone.description !== null && (
          <p className="mt-1 break-words text-muted-foreground text-sm leading-relaxed">
            {milestone.description}
          </p>
        )}
        <Link
          to={milestone.pageURL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex min-h-11 items-center gap-1 text-primary text-sm underline-offset-4 hover:underline md:min-h-8"
        >
          {t("GitHubで確認", "Check on GitHub")}
          <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </li>
  )
}

function MilestoneList (props: { milestones: Milestone[] }) {
  const t = useTranslation()

  const planned = props.milestones.filter((item) => !item.isDone)
  const done = props.milestones.filter((item) => item.isDone)
  const percent =
    props.milestones.length === 0
      ? 0
      : Math.round((done.length / props.milestones.length) * 100)

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {t(
              `${props.milestones.length} 件のうち ${done.length} 件をリリース済み`,
              `${done.length} of ${props.milestones.length} released`,
            )}
          </span>
          <span className="font-mono text-muted-foreground">{`${percent}%`}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("リリースの進み具合", "Release progress")}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-orange-400 via-sky-500 to-emerald-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-bold text-lg">{t("開発中", "In Progress")}</h2>
        {planned.length === 0 ? (
          <PictorChanSays>
            {t(
              "いまは全部リリース済みです！次は何が来るのでしょう？",
              "Everything is released right now! I wonder what's next?",
            )}
          </PictorChanSays>
        ) : (
          <ul className="group/list">
            {planned.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="released">
            <AccordionTrigger className="min-h-11">
              <h2 className="font-bold text-lg">
                {t(`リリース済み（${done.length}件）`, `Released (${done.length})`)}
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="group/list pt-1">
                {done.map((milestone) => (
                  <MilestoneItem key={milestone.id} milestone={milestone} />
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

export default function Milestone () {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()

  if (data == null) {
    return null
  }

  const plannedCount = data.milestones.filter((item) => !item.isDone).length

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-1 py-4">
      <div className="space-y-3">
        <h1 className="font-bold text-2xl md:text-3xl">
          {t("開発予定", "Development Milestones")}
        </h1>
        <PictorChanSays>
          {plannedCount > 0
            ? t(
                `いま開発中のものが ${plannedCount} 件あります。できあがるのが楽しみですね！`,
                `${plannedCount} in progress right now. I can't wait to see them!`,
              )
            : t(
                "いまは次の計画を練っているところです。お楽しみに！",
                "We're planning what's next. Stay tuned!",
              )}
        </PictorChanSays>
      </div>
      <Tabs defaultValue="web" className="w-full">
        <TabsList className="mb-4 grid h-11 w-full grid-cols-2">
          <TabsTrigger value="web" className="h-9">
            {t("Web版", "Web Version")}
          </TabsTrigger>
          <TabsTrigger value="app" className="h-9">
            {t("App版", "App Version")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="web" className="w-full">
          <MilestoneList milestones={data.milestones} />
        </TabsContent>
        <TabsContent value="app" className="w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link to="https://apps.apple.com/jp/app/aipictors-ai%E3%83%94%E3%82%AF%E3%82%BF%E3%83%BC%E3%82%BA/id6466581636">
                <img
                  src="/apple/download.svg"
                  alt={t("App Storeからダウンロード", "Download on the App Store")}
                  width={131}
                  height={48}
                  loading="lazy"
                  className="h-12 w-auto"
                />
              </Link>
              <Link to="https://play.google.com/store/apps/details?id=com.aipictors.app&hl=ja">
                <img
                  src="/google/download.png"
                  alt={t("Google Playで手に入れよう", "Get it on Google Play")}
                  width={165}
                  height={64}
                  loading="lazy"
                  className="h-16 w-auto"
                />
              </Link>
            </div>
            <MilestoneList milestones={data.appMilestones} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
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
