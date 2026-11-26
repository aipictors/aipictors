import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { viewerPlusStatusQuery } from "~/hooks/use-plus-status"
import { cn } from "~/lib/utils"

const PLAN_LABELS: Record<string, string> = {
  LITE: "Lite",
  STANDARD: "Standard",
  PREMIUM: "Premium",
}

type Props = {
  className?: string
}

/**
 * 左上のロゴ「Aipictors」の横に添える、加入中のプラン名（Lite / Standard / Premium）
 * 未加入・未ログイン・確認中は何も出さない。use-plus-status と同じ問い合わせなのでキャッシュで返る
 */
export function PlanLogoBadge(props: Props) {
  const authContext = useContext(AuthContext)

  const { data } = useQuery(viewerPlusStatusQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  if (authContext.isLoading || authContext.isNotLoggedIn) return null

  const passType = data?.viewer?.currentPass?.type
  const label = passType ? PLAN_LABELS[passType] : undefined
  if (label === undefined) return null

  return (
    <span
      className={cn(
        "-ml-1 whitespace-nowrap font-bold text-amber-500 text-xs leading-none dark:text-amber-400",
        props.className,
      )}
    >
      {label}
    </span>
  )
}
