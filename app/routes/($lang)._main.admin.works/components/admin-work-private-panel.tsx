import { Lock, LockOpen } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import {
  NOTIFY_TEMPLATES,
  type TemplateKey,
} from "~/routes/($lang)._main.admin.works/utils/admin-work-notify-templates"

/**
 * 非公開処理（理由文を確認して実行する）
 */
export function AdminWorkPrivatePanel(props: {
  defaultNotice: string
  isSendingMessage: boolean
  isUpdating: boolean
  notifyMessage: string
  onChangeAccessType: (target: "PRIVATE" | "PUBLIC") => void
  setNotifyMessage: (value: string) => void
  setTemplateKey: (value: TemplateKey) => void
  templateKey: TemplateKey
}) {
  const {
    defaultNotice,
    isSendingMessage,
    isUpdating,
    notifyMessage,
    onChangeAccessType,
    setNotifyMessage,
    setTemplateKey,
    templateKey,
  } = props

  return (
    <div className="rounded-[28px] border border-rose-400/20 bg-[linear-gradient(180deg,rgba(76,29,57,0.92)_0%,rgba(59,24,52,0.92)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-base text-rose-50">非公開処理</p>
          <p className="text-sm text-rose-100/70">
            テンプレートを選んで理由文を確認してから実行します。
          </p>
        </div>
        <Badge className="border border-rose-300/20 bg-rose-500/15 text-rose-50 hover:bg-rose-500/15">
          モデレーター操作
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>通知テンプレート</Label>
          <Select
            value={templateKey}
            onValueChange={(value) => setTemplateKey(value as TemplateKey)}
          >
            <SelectTrigger className="h-12 border-rose-300/20 bg-slate-950/40 text-slate-100">
              <SelectValue placeholder="テンプレートを選択" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100 backdrop-blur">
              {NOTIFY_TEMPLATES.map((reason) => (
                <SelectItem
                  key={reason.key}
                  value={reason.key}
                  className="text-slate-100 focus:bg-white/10 focus:text-white"
                >
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>利用者に見せる理由文</Label>
          <Textarea
            value={notifyMessage}
            onChange={(event) => setNotifyMessage(event.target.value)}
            placeholder={defaultNotice}
            rows={8}
            className="min-h-[220px] w-full resize-y border-rose-300/20 bg-slate-950/40 text-sm leading-7 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          size="sm"
          className="h-12 rounded-2xl bg-rose-600 px-5 text-base text-white hover:bg-rose-500"
          disabled={isUpdating || isSendingMessage}
          onClick={() => onChangeAccessType("PRIVATE")}
        >
          <Lock className="mr-1 size-4" />
          理由付きで非公開
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-12 rounded-2xl border-sky-400/30 bg-sky-500/15 px-5 text-base text-sky-100 hover:bg-sky-500/25"
          disabled={isUpdating || isSendingMessage}
          onClick={() => onChangeAccessType("PUBLIC")}
        >
          <LockOpen className="mr-1 size-4" />
          公開へ戻す
        </Button>
      </div>
    </div>
  )
}
