import { ChevronDownIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** 畳んでいるときに見せる、中に入っている項目 */
  summary: string
  /** 新規投稿では畳む。編集では今の設定が見えるように開いておく */
  isCollapsed?: boolean
  children: React.ReactNode
}

/**
 * たまにしか使わない設定をまとめて畳む。
 * 閉じていても中身は残すので、入力した内容は消えない
 */
export function PostFormAdvancedSection(props: Props) {
  const t = useTranslation()

  return (
    <details
      className="group rounded-lg border bg-card"
      open={props.isCollapsed !== true}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-bold text-sm">
            {t("詳細設定", "Advanced settings")}
          </span>
          <span className="block text-muted-foreground text-xs">
            {props.summary}
          </span>
        </span>
        <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t p-4">{props.children}</div>
    </details>
  )
}
