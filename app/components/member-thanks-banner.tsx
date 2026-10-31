import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Gift, X } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

const DISMISS_KEY = "member-thanks-2026-11"

/** この日を過ぎたら出さない */
const SHOW_UNTIL = Date.UTC(2026, 11, 1)

const THANKS_COINS: Record<string, number> = {
  LITE: 1000,
  STANDARD: 2000,
  PREMIUM: 4000,
}

const RENEWAL_BONUS: Record<string, number> = {
  LITE: 100,
  STANDARD: 300,
  PREMIUM: 600,
}

/**
 * 今の会員へのお礼（感謝コインと継続ボーナスのお知らせ）
 * 初月半額を始めたので、続けている会員が損をしたと感じないように、サイトを使ったときにだけ出す
 * （メールは最近使っていない会員には送らない方針なので、ここで伝える）
 */
export function MemberThanksBanner () {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [isVisible, setIsVisible] = useState(false)

  const { data } = useQuery(viewerPassForThanksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const passType = data?.viewer?.currentPass?.type ?? null

  useEffect(() => {
    if (Date.now() > SHOW_UNTIL) return
    if (localStorage.getItem(DISMISS_KEY) === "1") return
    setIsVisible(true)
  }, [])

  if (!isVisible || passType === null || !(passType in THANKS_COINS)) {
    return null
  }

  return (
    <div className="relative flex items-start gap-3 rounded-xl border border-fuchsia-500/30 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-3 pr-9 text-sm">
      <Gift className="mt-0.5 size-5 shrink-0 text-fuchsia-600 dark:text-fuchsia-300" />
      <div className="space-y-1">
        <p className="font-bold">
          {t(
            `いつもありがとうございます！感謝の気持ちとして${THANKS_COINS[passType].toLocaleString()}プレミアムコインをお贈りしました`,
            `Thank you! We sent you ${THANKS_COINS[passType].toLocaleString()} premium coins`,
          )}
        </p>
        <p className="text-muted-foreground text-xs">
          {t(
            `プレミアムコインに期限はありません。これからは更新のたびに継続ボーナスとして${RENEWAL_BONUS[passType]}プレミアムコインもお届けします。`,
            `Premium coins never expire. From now on you'll also get ${RENEWAL_BONUS[passType]} bonus coins every renewal.`,
          )}{" "}
          <Link to="/settings/points" className="underline">
            {t("コインを見る", "See coins")}
          </Link>
        </p>
      </div>
      <button
        type="button"
        aria-label={t("閉じる", "Close")}
        className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1")
          setIsVisible(false)
        }}
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

const viewerPassForThanksQuery = graphql(
  `query ViewerPassForThanks {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)
