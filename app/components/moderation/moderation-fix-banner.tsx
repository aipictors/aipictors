import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react"
import { getModerationReportGuide } from "~/lib/moderation/moderation-report-guide"
import { cn } from "~/lib/utils"

type Props = {
  reportType: string | null
  reportMessage: string | null
  isTemporaryPrivate: boolean
}

/**
 * 作品の編集画面のいちばん上に出す「運営からの修正依頼」
 * 何が問題で、どう直せばよいか、保存すると完了報告が自動で届くことを伝える
 */
export function ModerationFixBanner(props: Props) {
  const guide = getModerationReportGuide(props.reportType)

  return (
    <section
      className={cn(
        "space-y-3 rounded-2xl border p-4",
        guide.needsFix
          ? "border-amber-400/60 bg-amber-500/10"
          : "border-sky-400/50 bg-sky-500/10",
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangleIcon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            guide.needsFix ? "text-amber-600" : "text-sky-600",
          )}
        />
        <div className="min-w-0 space-y-1">
          <p className="font-bold">運営からの修正依頼：{guide.title}</p>
          {props.isTemporaryPrivate && (
            <p className="text-sm">
              この作品は今、<b>一時非公開</b>
              です。直して「更新する」を押すと自動で公開に戻ります。
            </p>
          )}
          {props.reportMessage && (
            <p className="text-muted-foreground text-sm">
              {props.reportMessage}
            </p>
          )}
        </div>
      </div>
      <ol className="list-decimal space-y-1 pl-9 text-sm">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="flex items-center gap-1.5 pl-8 text-muted-foreground text-xs">
        <CheckCircle2Icon className="size-3.5 text-emerald-500" />
        運営への完了報告は自動で届きます（何を直したかも自動で書きます。ひとこと添えたいときは下の欄へ）
      </p>
    </section>
  )
}
