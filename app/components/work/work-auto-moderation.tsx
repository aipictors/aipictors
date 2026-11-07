import { gql, useMutation, useQuery } from "@apollo/client/index"
import { ShieldAlertIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type AutoModeration = {
  workId: string
  status: "NONE" | "APPLIED" | "REVIEW" | "APPEALED" | "RESOLVED"
  previousRating: string
  appliedRating: string
  moderatorRating: string | null
  isChildRisk: boolean
  isHidden: boolean
  appealMessage: string | null
}

type QueryResult = {
  work: { id: string; autoModeration: AutoModeration | null } | null
}

export const workAutoModerationQuery = gql`
  query WorkAutoModeration($id: ID!) {
    work(id: $id) {
      id
      autoModeration {
        workId
        status
        previousRating
        appliedRating
        moderatorRating
        isChildRisk
        isHidden
        appealMessage
      }
    }
  }
`

const appealMutation = gql`
  mutation AppealWorkAutoModeration($workId: ID!, $message: String) {
    appealWorkAutoModeration(workId: $workId, message: $message)
  }
`

export const ratingLabel = (rating: string | null | undefined) => {
  if (rating === "R18G") return "R-18G"
  if (rating === "R18") return "R-18"
  if (rating === "R15") return "R-15"
  return "全年齢"
}

/**
 * 投稿の直後に、画像の自動判定の結果を知らせる（判定は投稿後に数秒かかるので少し待つ）
 */
export function WorkAutoModerationPostNotice(props: { workId: string | null }) {
  const t = useTranslation()
  const [isWaiting, setIsWaiting] = useState(true)

  const { data, startPolling, stopPolling } = useQuery<QueryResult>(
    workAutoModerationQuery,
    {
      skip: props.workId === null,
      variables: { id: props.workId },
      fetchPolicy: "network-only",
    },
  )

  const autoModeration = data?.work?.autoModeration ?? null

  useEffect(() => {
    if (props.workId === null) return
    startPolling(3000)
    const timer = setTimeout(() => {
      stopPolling()
      setIsWaiting(false)
    }, 30_000)
    return () => {
      clearTimeout(timer)
      stopPolling()
    }
  }, [props.workId, startPolling, stopPolling])

  useEffect(() => {
    if (autoModeration !== null) {
      stopPolling()
      setIsWaiting(false)
    }
  }, [autoModeration, stopPolling])

  if (autoModeration === null || autoModeration.status === "NONE") {
    if (isWaiting && props.workId !== null) {
      return (
        <p className="text-center text-muted-foreground text-xs">
          {t(
            "画像の年齢区分を自動で確認しています…",
            "Checking the age rating…",
          )}
        </p>
      )
    }
    return null
  }

  return <WorkAutoModerationSummary autoModeration={autoModeration} />
}

function WorkAutoModerationSummary(props: { autoModeration: AutoModeration }) {
  const t = useTranslation()
  const { autoModeration } = props
  const isRaised =
    autoModeration.previousRating !== autoModeration.appliedRating

  return (
    <div className="space-y-1 rounded-lg border border-amber-400/60 bg-amber-500/10 p-3 text-sm">
      <p className="flex items-center gap-1.5 font-bold">
        <ShieldAlertIcon className="size-4" />
        {t("画像の自動判定", "Automatic rating check")}
      </p>
      {isRaised && (
        <p>
          {t(
            `年齢区分を「${ratingLabel(autoModeration.previousRating)}」から「${ratingLabel(autoModeration.appliedRating)}」に変更しました。`,
            `The age rating was changed from ${ratingLabel(autoModeration.previousRating)} to ${ratingLabel(autoModeration.appliedRating)}.`,
          )}
        </p>
      )}
      {autoModeration.isHidden && (
        <p>
          {t(
            "運営が確認するまで、一時的に非公開にしました。",
            "The work is private until the team reviews it.",
          )}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        {t(
          "自動判定のため間違っていることがあります。違う場合は",
          "Automatic checks can be wrong. If so, tell us from",
        )}
        <Link to="/my/reports" className="mx-1 underline">
          {t("運営からのお知らせ", "Notices from the team")}
        </Link>
        {t("の「判定が違う」から運営にお知らせください。", '("Not correct").')}
      </p>
    </div>
  )
}

/**
 * 運営からのお知らせの中で、自動判定のときだけ「判定が違う」を出す
 */
export function WorkAutoModerationAppeal(props: { workId: string }) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const { data, refetch } = useQuery<QueryResult>(workAutoModerationQuery, {
    variables: { id: props.workId },
    fetchPolicy: "cache-and-network",
  })

  const [appeal, { loading }] = useMutation(appealMutation)

  const autoModeration = data?.work?.autoModeration ?? null

  if (autoModeration === null || autoModeration.status === "NONE") {
    return null
  }

  if (autoModeration.status === "RESOLVED") {
    return (
      <p className="text-muted-foreground text-xs">
        {t(
          `自動判定について運営が確認しました（区分: ${ratingLabel(autoModeration.moderatorRating)}）`,
          `The team reviewed the automatic check (rating: ${ratingLabel(autoModeration.moderatorRating)})`,
        )}
      </p>
    )
  }

  if (autoModeration.status === "APPEALED") {
    return (
      <p className="text-muted-foreground text-xs">
        {t(
          "「判定が違う」と運営にお知らせしました。確認までお待ちください。",
          "You told us the check was wrong. Please wait for the review.",
        )}
      </p>
    )
  }

  const onSubmit = async () => {
    try {
      await appeal({ variables: { workId: props.workId, message } })
      toast.success(t("運営にお知らせしました", "Sent to the team"))
      setIsOpen(false)
      void refetch()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("送れませんでした", "Failed to send"),
      )
    }
  }

  return (
    <div className="space-y-2 rounded-lg bg-background p-2">
      <p className="text-xs">
        {t(
          "このお知らせは画像の自動判定によるものです。",
          "This notice comes from an automatic image check.",
        )}
      </p>
      {isOpen ? (
        <div className="space-y-2">
          <Textarea
            value={message}
            maxLength={500}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t(
              "違うと思う理由（任意）。例: 水着ではなく私服です",
              "Why it is wrong (optional)",
            )}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="rounded-full"
              disabled={loading}
              onClick={() => void onSubmit()}
            >
              {t("運営に送る", "Send")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsOpen(false)}
            >
              {t("やめる", "Cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setIsOpen(true)}
        >
          {t("判定が違う", "Not correct")}
        </Button>
      )}
    </div>
  )
}
