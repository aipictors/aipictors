import { gql, useMutation } from "@apollo/client/index"
import { FlagIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  eventId: string
}

const REASONS = [
  { value: "HARASSMENT", ja: "特定の人への誹謗中傷・名指し", en: "Harassment" },
  { value: "SPAM", ja: "宣伝・勧誘・スパム・同じお題の乱立", en: "Spam" },
  { value: "PROHIBITED", ja: "禁止されている内容", en: "Prohibited content" },
  { value: "OTHER", ja: "その他", en: "Other" },
]

/**
 * ユーザー主催のお題（ユーザー企画）を運営に通報するダイアログ
 */
export function UserEventReportDialog(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [mutation, { loading }] = useMutation(reportUserEventMutation)

  const onReport = async () => {
    if (authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }
    const selected = REASONS.find((item) => item.value === reason)
    if (!selected) {
      toast(t("通報の理由を選択してください", "Please select a reason"))
      return
    }
    try {
      await mutation({
        variables: {
          input: {
            eventId: props.eventId,
            reason: [selected.ja, details.trim()].filter(Boolean).join("\n"),
          },
        },
      })
      toast(
        t(
          "通報しました。ご協力ありがとうございます。",
          "Reported. Thank you.",
        ),
      )
      setReason("")
      setDetails("")
      setOpen(false)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="gap-2 text-muted-foreground"
          aria-label={t("通報", "Report")}
        >
          <FlagIcon className="size-4" />
          <span className="sr-only md:not-sr-only">{t("通報", "Report")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("このお題を通報する", "Report this event")}</DialogTitle>
          <DialogDescription>
            {t(
              "運営が確認します。複数の方から通報があったお題は、確認するまで非表示になります。",
              "Our team will review it. Events reported by several people are hidden until reviewed.",
            )}
          </DialogDescription>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder={t("理由を選択", "Select a reason")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {REASONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {t(item.ja, item.en)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={t("必要であれば詳細を入力してください", "Add details if needed")}
          maxLength={900}
          className="min-h-28 resize-none"
        />
        <DialogFooter>
          <Button onClick={onReport} disabled={loading}>
            {t("送信", "Submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const reportUserEventMutation = gql`
  mutation ReportUserEvent($input: ReportUserEventInput!) {
    reportUserEvent(input: $input)
  }
`
