import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { reportUserModel } from "~/lib/user-models/client"
import { USER_MODEL_REPORT_REASONS } from "~/lib/user-models/constants"
import type { UserModel, UserModelReportReason } from "~/lib/user-models/types"

type Props = {
  model: Pick<UserModel, "id" | "name">
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
}

const DETAIL_MAX_LENGTH = 1000

/**
 * モデルの通報
 */
export function UserModelReportDialog(props: Props) {
  const [reason, setReason] = useState<UserModelReportReason | "">("")
  const [detail, setDetail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    if (!reason) {
      return
    }
    setIsSubmitting(true)
    try {
      await reportUserModel(props.model.id, {
        reason,
        detail: detail.trim() || undefined,
      })
      toast("通報を受け付けました。確認します")
      setReason("")
      setDetail("")
      props.onOpenChange(false)
    } catch (error) {
      toast(error instanceof Error ? error.message : "通報に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>モデルを通報</DialogTitle>
          <DialogDescription>
            「{props.model.name}
            」について、気になる点を運営に知らせます。通報したことは作者には伝わりません。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-model-report-reason">理由</Label>
            <Select
              value={reason}
              onValueChange={(value) =>
                setReason(value as UserModelReportReason)
              }
            >
              <SelectTrigger id="user-model-report-reason">
                <SelectValue placeholder="理由を選んでください" />
              </SelectTrigger>
              <SelectContent>
                {USER_MODEL_REPORT_REASONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-model-report-detail">
              詳細
              <span className="ml-1 font-normal text-muted-foreground text-xs">
                任意
              </span>
            </Label>
            <Textarea
              id="user-model-report-detail"
              value={detail}
              onChange={(event) =>
                setDetail(event.target.value.slice(0, DETAIL_MAX_LENGTH))
              }
              rows={4}
              placeholder="元のモデルの URL など、確認の手がかりがあれば書いてください"
            />
            <p className="text-right text-muted-foreground text-xs tabular-nums">
              {detail.length}/{DETAIL_MAX_LENGTH}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={() => props.onOpenChange(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? "送信中…" : "通報する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
