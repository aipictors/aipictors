import { useMutation, useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  InfoIcon,
  Loader2Icon,
  PencilIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { getModerationReportGuide } from "~/lib/moderation/moderation-report-guide"
import { cn } from "~/lib/utils"

type Props = {
  page: number
  maxCount: number
  setPage: (page: number) => void
}

type Tab = "ACTION" | "INFO" | "DONE"

const editUrl = (id: string, workType: IntrospectionEnum<"WorkType">) => {
  if (workType === "VIDEO") return `/posts/${id}/animation/edit`
  if (workType === "COLUMN" || workType === "NOVEL")
    return `/posts/${id}/text/edit`
  return `/posts/${id}/image/edit`
}

const formatDate = (epoch: number) =>
  new Date(epoch * 1000).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })

/**
 * 運営からのお知らせ（修正依頼）
 * 「対応が必要」「お知らせのみ（運営が変更済み）」「対応済み」に分け、
 * 何が問題でどう直すかと、編集・完了報告のボタンを出す
 */
export function ModerationReportsContainer(_props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [tab, setTab] = useState<Tab>("ACTION")

  const { data, loading, refetch } = useQuery(moderationReportsQuery, {
    skip: authContext.isLoading || !authContext.userId,
    variables: {
      offset: 0,
      limit: 200,
      where: { userId: authContext.userId },
    },
    fetchPolicy: "cache-and-network",
  })

  const reports = (data?.moderationReports ?? []).filter(
    (report) => report !== null,
  )

  const groupOf = (report: (typeof reports)[number]): Tab => {
    // 区分の変更など、運営が変更済みで直す必要がないものは「お知らせのみ」
    if (!getModerationReportGuide(report.reportType).needsFix) return "INFO"
    if (report.status === "NO_NEED_ACTION") return "INFO"
    if (report.status === "DONE") return "DONE"
    return "ACTION"
  }

  const counts = {
    ACTION: reports.filter((report) => groupOf(report) === "ACTION").length,
    INFO: reports.filter((report) => groupOf(report) === "INFO").length,
    DONE: reports.filter((report) => groupOf(report) === "DONE").length,
  }

  const visible = reports.filter((report) => groupOf(report) === tab)

  const tabs: { value: Tab; label: string }[] = [
    { value: "ACTION", label: t("対応が必要", "Action needed") },
    { value: "INFO", label: t("お知らせのみ", "Info only") },
    { value: "DONE", label: t("対応済み", "Resolved") },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="space-y-1">
        <h1 className="font-bold text-xl">
          {t("運営からのお知らせ", "Notices from the team")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t(
            "規約に合わせて作品を変更したときや、直してほしいところがあるときにお知らせします。編集して「更新」を押すと、完了報告は自動で届きます。",
            "We notify you when we change your work or need a fix. Saving your edit reports the fix automatically.",
          )}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-bold text-sm transition",
              tab === item.value
                ? "border-foreground bg-foreground text-background"
                : "bg-card hover:bg-muted",
            )}
          >
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                item.value === "ACTION" && counts.ACTION > 0
                  ? "bg-amber-500 text-white"
                  : "opacity-70",
              )}
            >
              {counts[item.value]}
            </span>
          </button>
        ))}
      </div>

      {loading && reports.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center text-muted-foreground">
          <CheckCircle2Icon className="size-8 text-emerald-500" />
          <p className="text-sm">
            {tab === "ACTION"
              ? t(
                  "対応が必要なお知らせはありません",
                  "Nothing needs your action",
                )
              : t("お知らせはありません", "No notices")}
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            group={groupOf(report)}
            onResponded={() => void refetch()}
          />
        ))}
      </ul>
    </div>
  )
}

function ReportCard(props: {
  report: NonNullable<
    NonNullable<
      ReturnType<typeof useQuery<typeof moderationReportsQuery>>["data"]
    >["moderationReports"][number]
  >
  group: Tab
  onResponded: () => void
}) {
  const t = useTranslation()
  const { report } = props
  const guide = getModerationReportGuide(report.reportType)
  const [isOpen, setIsOpen] = useState(props.group === "ACTION")
  const [respond, { loading }] = useMutation(respondModerationReportMutation)
  const work = report.work

  const onRespond = async () => {
    try {
      await respond({ variables: { id: report.id, message: "対応しました" } })
      toast.success(t("運営に完了を報告しました", "Reported as resolved"))
      props.onResponded()
    } catch {
      toast.error(t("報告できませんでした", "Failed to report"))
    }
  }

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        props.group === "ACTION" && "border-amber-400/60",
      )}
    >
      <div className="flex gap-3 p-3">
        {work ? (
          <Link
            to={`/posts/${work.id}`}
            className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
          >
            <img
              src={work.smallThumbnailImageURL}
              alt={work.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="size-20 shrink-0 rounded-xl bg-muted" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[11px]",
                props.group === "ACTION" &&
                  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                props.group === "INFO" &&
                  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                props.group === "DONE" &&
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
              )}
            >
              {props.group === "ACTION" ? (
                <AlertTriangleIcon className="size-3" />
              ) : props.group === "INFO" ? (
                <InfoIcon className="size-3" />
              ) : (
                <CheckCircle2Icon className="size-3" />
              )}
              {props.group === "ACTION"
                ? t("対応が必要", "Action needed")
                : props.group === "INFO"
                  ? t("お知らせのみ", "Info")
                  : t("対応済み", "Resolved")}
            </span>
            {!report.isRead && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.5 font-bold text-[10px] text-white">
                NEW
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              {formatDate(report.createdAt)}
            </span>
          </div>
          <p className="truncate font-bold text-sm">
            {work ? `「${work.title}」` : t("（削除された作品）", "(deleted)")}
          </p>
          <p className="text-sm">{guide.title}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between border-t px-3 py-2 text-left text-muted-foreground text-xs hover:bg-muted/50"
      >
        {isOpen
          ? t("閉じる", "Hide")
          : t("内容と直し方を見る", "Details & how to fix")}
        <ChevronDownIcon
          className={cn("size-4 transition", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t bg-muted/30 p-3 text-sm">
          {report.reportMessage && (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {report.reportMessage}
            </p>
          )}
          {report.customMessage && (
            <p className="rounded-lg bg-background p-2">
              {t("運営からのひとこと", "Note")}: {report.customMessage}
            </p>
          )}
          {props.group !== "DONE" && (
            <ol className="list-decimal space-y-1 pl-5">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          {report.responseMessage && (
            <p className="text-muted-foreground text-xs">
              {t("あなたの報告", "Your report")}: 「{report.responseMessage}」
            </p>
          )}
        </div>
      )}

      {work && props.group === "ACTION" && (
        <div className="flex flex-wrap gap-2 border-t p-3">
          <Button asChild className="flex-1 rounded-full font-bold">
            <Link to={editUrl(work.id, work.type)}>
              <PencilIcon className="mr-1.5 size-4" />
              {t("編集して直す", "Edit & fix")}
            </Link>
          </Button>
          <Button
            variant="secondary"
            className="flex-1 rounded-full"
            disabled={loading}
            onClick={() => void onRespond()}
          >
            <CheckCircle2Icon className="mr-1.5 size-4" />
            {t("直した・削除したので完了報告", "Already fixed")}
          </Button>
        </div>
      )}
      {work && props.group !== "ACTION" && (
        <div className="flex gap-2 border-t p-3">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="rounded-full"
          >
            <Link to={`/posts/${work.id}`}>{t("作品を見る", "View")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to={editUrl(work.id, work.type)}>{t("編集", "Edit")}</Link>
          </Button>
        </div>
      )}
    </li>
  )
}

const moderationReportsQuery = graphql(
  `query ModerationReports($offset: Int!, $limit: Int!, $where: ModerationReportsWhereInput!) {
    moderationReports(offset: $offset, limit: $limit, where: $where) {
      id
      createdAt
      work {
        id
        title
        smallThumbnailImageURL
        type
      }
      customMessage
      isRead
      responseMessage
      status
      reportMessage
      reportType
    }
  }`,
)

const respondModerationReportMutation = graphql(
  `mutation RespondModerationReport($id: ID!, $message: String) {
    respondModerationReport(id: $id, message: $message)
  }`,
)
