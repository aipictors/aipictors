import { gql, useMutation } from "@apollo/client/index"
import { FlagIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
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
  proposalId: string
}

/**
 * お題提案を運営に通報するダイアログ
 */
export function ThemeProposalReportDialog(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [mutation, { loading }] = useMutation(reportThemeProposalMutation)

  const onReport = async () => {
    if (authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }

    if (reason.length === 0) {
      toast(t("通報の理由を選択してください", "Please select a reason"))
      return
    }

    try {
      await mutation({
        variables: {
          proposalId: props.proposalId,
          reason,
          comment: details.trim() || null,
        },
      })

      toast(
        t(
          "お題提案を通報しました。ご協力ありがとうございます。",
          "The proposal has been reported. Thank you.",
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
          size="sm"
          variant="ghost"
          className="size-7 px-0 text-muted-foreground"
          aria-label={t("通報", "Report")}
          title={t("通報", "Report")}
        >
          <FlagIcon className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("お題提案を通報する", "Report this proposal")}
          </DialogTitle>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder={t("理由を選択", "Select a reason")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="PRIVACY_VIOLATION">
                {t(
                  "特定の人への誹謗中傷・名指し",
                  "Harassment or naming a specific person",
                )}
              </SelectItem>
              <SelectItem value="COMMERCIAL_CONTENT">
                {t("宣伝・勧誘・スパム", "Spam or solicitation")}
              </SelectItem>
              <SelectItem value="ILLEGAL_CONTENT">
                {t("禁止されている内容", "Prohibited content")}
              </SelectItem>
              <SelectItem value="OTHER">{t("その他", "Other")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={t(
            "必要であれば詳細を入力してください",
            "Add details if needed",
          )}
          maxLength={1000}
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

const reportThemeProposalMutation = gql`
  mutation ReportThemeProposal(
    $proposalId: ID!
    $reason: ReportReason!
    $comment: String
  ) {
    reportThemeProposal(
      proposalId: $proposalId
      reason: $reason
      comment: $comment
    )
  }
`
