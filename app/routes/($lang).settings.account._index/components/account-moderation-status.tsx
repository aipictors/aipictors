import { gql, useQuery } from "@apollo/client/index"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type Restriction = { id: string; endsAt: number | null; reason: string }

/** UNIX 秒 → 日本時間の「2026/11/25 13:40」 */
const toJstText = (time: number) => {
  const date = new Date(time * 1000 + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

/**
 * アカウントの状態（ガイドライン違反の回数と、コメント・投稿の停止）
 */
export function AccountModerationStatus() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { data } = useQuery(viewerModerationStatusQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-and-network",
  })
  const status = data?.viewerModerationStatus
  if (!status) return null

  const restrictions = [
    { label: t("コメント", "Comments"), row: status.commentRestriction },
    { label: t("作品の投稿", "Posting"), row: status.postRestriction },
  ].filter(
    (item): item is { label: string; row: Restriction } => item.row !== null,
  )
  const strikeCount = status.commentStrikeCount + status.postStrikeCount

  if (restrictions.length === 0 && strikeCount === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-4 text-sm">
        <ShieldCheck className="size-4 text-emerald-500" />
        <span>
          {t("アカウントの状態: 問題ありません", "Account status: no issues")}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-lg border border-red-500/40 bg-red-500/5 px-4 py-4 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <ShieldAlert className="size-4 text-red-500" />
        {t("アカウントの状態", "Account status")}
      </div>
      {restrictions.map((item) => (
        <p key={item.row.id}>
          {item.label}
          {t("は ", " is restricted ")}
          {item.row.endsAt === null
            ? t("運営が解除するまで", "until lifted by the staff")
            : t(
                `${toJstText(item.row.endsAt)} まで`,
                `until ${toJstText(item.row.endsAt)} (JST)`,
              )}
          {t(" 停止されています（理由: ", " (reason: ")}
          {item.row.reason}
          {t("）", ")")}
        </p>
      ))}
      <p className="text-muted-foreground">
        {t(
          `直近 90 日のガイドライン違反: コメント ${status.commentStrikeCount} 回・投稿 ${status.postStrikeCount} 回。違反は 90 日で消え、回数が増えるほど停止が長くなります。`,
          `Guideline strikes in the last 90 days: comments ${status.commentStrikeCount}, posts ${status.postStrikeCount}. Strikes expire after 90 days; repeated strikes lead to longer restrictions.`,
        )}
      </p>
    </div>
  )
}

const viewerModerationStatusQuery = gql`
  query ViewerModerationStatus {
    viewerModerationStatus {
      commentStrikeCount
      postStrikeCount
      commentRestriction {
        id
        endsAt
        reason
      }
      postRestriction {
        id
        endsAt
        reason
      }
    }
  }
`
