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

type Props = {
  postId: string
}

/**
 * 作品の報告ダイアログ
 */
export function ReportDialog(props: Props) {
  const [reason, setReason] = useState("")
  const [comment, setComment] = useState("")
  const [mutation, { loading: isLoading }] = useMutation(reportWorkMutation)
  const authContext = useContext(AuthContext)

  const onReport = async () => {
    try {
      if (authContext.isNotLoggedIn) {
        toast("ログインしてください")
        return
      }

      if (reason === "") {
        toast("報告内容を選択してください")
        return
      }

      if (comment.length === 0) {
        toast("詳細を入力してください")
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
        toast("報告いたしました、ご協力ありがとうございます。")
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
          問題を報告する
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>問題を報告する</DialogTitle>
        </DialogHeader>
        <h4 className="text-md">{"報告内容"}</h4>
        <Select onValueChange={(value) => setReason(value)}>
          <SelectTrigger>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{"選択してください"}</SelectLabel>
              <SelectItem value="AGE_MISMATCH">
                {"対象年齢が異なる（過度な性的表現など）"}
              </SelectItem>
              <SelectItem value="TASTE_MISMATCH">
                {"テイストが異なる"}
              </SelectItem>
              <SelectItem value="NO_MOSAIC">
                {"必要なモザイク加工がされていない"}
              </SelectItem>
              <SelectItem value="PRIVACY_VIOLATION">
                {"プライバシーまたは肖像権を侵害している"}
              </SelectItem>
              <SelectItem value="UNAUTHORIZED_REPOST">
                {"無断転載している"}
              </SelectItem>
              <SelectItem value="COMMERCIAL_CONTENT">
                {"商業用の広告や宣伝、勧誘を目的とする情報が含まれている"}
              </SelectItem>
              <SelectItem value="EXCESSIVE_GORE">
                {"過度なグロテスク表現が含まれている"}
              </SelectItem>
              <SelectItem value="CHILD_PORNOGRAPHY">
                {
                  "実写に見える作品で、児童ポルノと認定される恐れのある内容が含まれている"
                }
              </SelectItem>
              <SelectItem value="ILLEGAL_CONTENT">
                {"サイトで禁止されているコンテンツへの誘導が含まれている"}
              </SelectItem>
              <SelectItem value="OTHER">{"その他"}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <h4 className="text-md">{"詳細（任意）"}</h4>
        <DialogDescription>
          {
            "無断転載、プライバシー、肖像権についての報告の場合は、転載元や侵害されている人物の情報を記載してください"
          }
        </DialogDescription>
        <Textarea
          placeholder="問題の詳細を入力してください"
          className="resize-none"
          onChange={(e) => setComment(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onReport} disabled={isLoading}>
              {"送信"}
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
