import { useMutation, gql } from "@apollo/client/index"
import { MessageSquareWarning } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import { Textarea } from "~/components/ui/textarea"

type Props = {
  commentId: string
}

export function CommentAppealDialog(props: Props) {
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [mutation, { loading }] = useMutation(appealCommentModerationMutation)

  const onAppeal = async () => {
    if (text.trim().length < 5) {
      toast(t("内容を入力してください", "Please enter the details"))
      return
    }

    try {
      await mutation({
        variables: {
          input: {
            commentId: props.commentId,
            text: text.trim(),
          },
        },
      })
      toast(
        t(
          "異議申し立てを送信しました。確認までお待ちください。",
          "Your appeal has been submitted.",
        ),
      )
      setText("")
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
          <MessageSquareWarning className="mr-1 size-3" />
          {t("異議申し立て", "Appeal")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("コメント審査に異議申し立て", "Appeal moderation")}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t(
            "誤判定だと思う理由を入力してください",
            "Explain why you think this decision is incorrect",
          )}
          className="min-h-32 resize-none"
        />
        <DialogFooter>
          <Button onClick={onAppeal} disabled={loading}>
            {t("送信", "Submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const appealCommentModerationMutation = gql`
  mutation AppealCommentModerationDialog($input: AppealCommentModerationInput!) {
    appealCommentModeration(input: $input)
  }
`