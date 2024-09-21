import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { FlagIcon } from "lucide-react"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"
import { useContext, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  postId: string
}

/**
 * Report Dialog for a post
 */
export function ReportDialog(props: Props) {
  const [reason, setReason] = useState("")
  const [comment, setComment] = useState("")
  const [mutation, { loading: isLoading }] = useMutation(reportWorkMutation)
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const onReport = async () => {
    try {
      if (authContext.isNotLoggedIn) {
        toast(t("ログインしてください", "Please log in"))
        return
      }

      if (reason === "") {
        toast(t("報告内容を選択してください", "Please select a reason"))
        return
      }

      if (comment.length === 0) {
        toast(t("詳細を入力してください", "Please provide details"))
        return
      }

      await mutation({
        variables: {
          input: {
            workId: props.postId,
            reason: reason as IntrospectionEnum<"ReportReason">,
            comment,
          },
        },
      }).then(async (result) => {
        toast(
          t(
            "報告いたしました、ご協力ありがとうございます。",
            "Your report has been submitted. Thank you for your cooperation.",
          ),
        )
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" variant="outline">
          <FlagIcon />
          {t("問題を報告する", "Report an issue")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("問題を報告する", "Report an issue")}</DialogTitle>
        </DialogHeader>
        <h4 className="text-md">{t("報告内容", "Report Reason")}</h4>
        <Select onValueChange={(value) => setReason(value)}>
          <SelectTrigger>
            <SelectValue placeholder={t("選択してください", "Please select")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                {t("選択してください", "Please select")}
              </SelectLabel>
              <SelectItem value="AGE_MISMATCH">
                {t(
                  "対象年齢が異なる（過度な性的表現など）",
                  "Age mismatch (e.g., excessive sexual content)",
                )}
              </SelectItem>
              <SelectItem value="TASTE_MISMATCH">
                {t("テイストが異なる", "Taste mismatch")}
              </SelectItem>
              <SelectItem value="NO_MOSAIC">
                {t(
                  "必要なモザイク加工がされていない",
                  "Lack of required mosaics",
                )}
              </SelectItem>
              <SelectItem value="PRIVACY_VIOLATION">
                {t(
                  "プライバシーまたは肖像権を侵害している",
                  "Privacy or image rights violation",
                )}
              </SelectItem>
              <SelectItem value="UNAUTHORIZED_REPOST">
                {t("無断転載している", "Unauthorized repost")}
              </SelectItem>
              <SelectItem value="COMMERCIAL_CONTENT">
                {t(
                  "商業用の広告や宣伝、勧誘を目的とする情報が含まれている",
                  "Contains commercial content or solicitation",
                )}
              </SelectItem>
              <SelectItem value="EXCESSIVE_GORE">
                {t(
                  "過度なグロテスク表現が含まれている",
                  "Contains excessive gore",
                )}
              </SelectItem>
              <SelectItem value="CHILD_PORNOGRAPHY">
                {t(
                  "実写に見える作品で、児童ポルノと認定される恐れのある内容が含まれている",
                  "Contains content that may be classified as child pornography",
                )}
              </SelectItem>
              <SelectItem value="ILLEGAL_CONTENT">
                {t(
                  "サイトで禁止されているコンテンツへの誘導が含まれている",
                  "Contains links to prohibited content",
                )}
              </SelectItem>
              <SelectItem value="OTHER">{t("その他", "Other")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <h4 className="text-md">{t("詳細（任意）", "Details (Optional)")}</h4>
        <DialogDescription>
          {t(
            "無断転載、プライバシー、肖像権についての報告の場合は、転載元や侵害されている人物の情報を記載してください",
            "If reporting for unauthorized reposts, privacy, or image rights violations, please provide details of the original source or the person affected.",
          )}
        </DialogDescription>
        <Textarea
          placeholder={t(
            "問題の詳細を入力してください",
            "Please provide details of the issue",
          )}
          className="resize-none"
          onChange={(e) => setComment(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onReport} disabled={isLoading}>
              {t("送信", "Submit")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const reportWorkMutation = graphql(
  `mutation ReportWork($input: ReportWorkInput!) {
    reportWork(input: $input)
  }`,
)
