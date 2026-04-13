import { useMutation, gql } from "@apollo/client/index"
import { FlagIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"

type Props = {
  commentId: string
}

export function CommentReportDialog(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [mutation, { loading }] = useMutation(reportCommentMutation)

  const onReport = async () => {
    if (authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }

    if (reason.length === 0) {
      toast(t("報告理由を選択してください", "Please select a reason"))
      return
    }

    try {
      await mutation({
        variables: {
          input: {
            commentId: props.commentId,
            reason,
            comment: details.trim() || null,
          },
        },
      })

      toast(
        t(
          "コメントを報告しました。ご協力ありがとうございます。",
          "The comment has been reported. Thank you.",
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
        <Button size="sm" variant="ghost" className="h-auto px-1 text-xs">
          <FlagIcon className="mr-1 size-3" />
          {t("報告", "Report")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("コメントを報告する", "Report comment")}</DialogTitle>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder={t("理由を選択", "Select a reason")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("理由", "Reason")}</SelectLabel>
              <SelectItem value="COMMERCIAL_CONTENT">
                {t("宣伝・勧誘・スパム", "Spam or solicitation")}
              </SelectItem>
              <SelectItem value="PRIVACY_VIOLATION">
                {t("プライバシー侵害", "Privacy violation")}
              </SelectItem>
              <SelectItem value="EXCESSIVE_GORE">
                {t("過度に暴力的・グロテスク", "Excessive violence or gore")}
              </SelectItem>
              <SelectItem value="ILLEGAL_CONTENT">
                {t("禁止コンテンツへの誘導", "Links to prohibited content")}
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

const reportCommentMutation = gql`
  mutation ReportCommentDialog($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`