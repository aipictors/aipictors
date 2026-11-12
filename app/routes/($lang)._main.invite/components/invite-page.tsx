import { GiftIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { REFERRAL_REWARDS } from "~/lib/referral/referral-rewards"
import {
  fetchReferralEnabled,
  getReferralDeviceId,
  readStoredReferral,
} from "~/lib/referral/referral-storage"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { InviteGuestPanel } from "~/routes/($lang)._main.invite/components/invite-guest-panel"
import { InviteLinkPanel } from "~/routes/($lang)._main.invite/components/invite-link-panel"
import { InviteNoteList } from "~/routes/($lang)._main.invite/components/invite-note-list"
import { InviteRewardSteps } from "~/routes/($lang)._main.invite/components/invite-reward-steps"
import { InviteStats } from "~/routes/($lang)._main.invite/components/invite-stats"
import type { ReferralSummary } from "~/routes/api.referral.summary/route"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type SummaryState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "done"; summary: ReferralSummary }

/**
 * 紹介特典のページの中身
 * - ログイン中: 自分の紹介リンク・共有・これまでの紹介人数と受け取ったコイン
 * - 未ログイン: 紹介リンクから来た人には「登録すると 300 コイン」、そうでない人にはログインの案内
 */
export function InvitePage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [state, setState] = useState<SummaryState>({ kind: "loading" })
  // 紹介リンクから来たか（URL の ref は ReferralWatcher が端末に覚える。少し遅れて読めるようになる）
  const [hasReferral, setHasReferral] = useState(false)
  // 紹介特典を受け付けているか（未ログインの人は別の口で確かめる。ログイン中は下の内容に含まれる）
  const [isGuestEnabled, setIsGuestEnabled] = useState(true)

  useEffect(() => {
    if (!authContext.isNotLoggedIn) return
    let isCancelled = false
    fetchReferralEnabled().then((value) => {
      if (!isCancelled) setIsGuestEnabled(value)
    })
    return () => {
      isCancelled = true
    }
  }, [authContext.isNotLoggedIn])

  useEffect(() => {
    if (!authContext.isNotLoggedIn) return
    const read = () => setHasReferral(readStoredReferral() !== null)
    read()
    const timer = window.setTimeout(read, 1200)
    return () => window.clearTimeout(timer)
  }, [authContext.isNotLoggedIn])

  // 表示の回数（1 画面 1 回。未ログイン・ログイン中に分ける）
  useEffect(() => {
    if (authContext.isLoading) return
    trackGrowthEvent("invite_view", authContext.isLoggedIn ? "member" : "guest")
  }, [authContext.isLoading, authContext.isLoggedIn])

  useEffect(() => {
    if (!authContext.isLoggedIn) return
    let isCancelled = false
    const load = async () => {
      try {
        const response = await fetch("/api/referral/summary", {
          method: "POST",
          headers: await getViewerRequestHeaders({ includeJsonContentType: true }),
          body: JSON.stringify({ deviceId: getReferralDeviceId() }),
        })
        const json = (await response.json().catch(() => null)) as {
          data: ReferralSummary | null
        } | null
        if (isCancelled) return
        if (!response.ok || !json?.data) {
          setState({ kind: "error" })
          return
        }
        setState({ kind: "done", summary: json.data })
      } catch {
        if (!isCancelled) setState({ kind: "error" })
      }
    }
    load()
    return () => {
      isCancelled = true
    }
  }, [authContext.isLoggedIn])

  const rewards = state.kind === "done" ? state.summary.rewards : REFERRAL_REWARDS
  const maxPerFriend = rewards.action + rewards.paid
  const isEnabled = authContext.isLoggedIn
    ? state.kind !== "done" || state.summary.enabled !== false
    : isGuestEnabled
  // 紹介リンクから来た未ログインの人には、招待された側の案内を出す
  const isInvitedGuest = authContext.isNotLoggedIn && hasReferral && isEnabled

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-12 md:space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-500/15 via-fuchsia-500/5 to-sky-500/15 px-4 py-6 md:px-10 md:py-10">
        <div className="-top-24 -right-20 pointer-events-none absolute size-72 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="-bottom-24 -left-16 pointer-events-none absolute size-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1 rounded-full border bg-background/70 px-3 py-1 font-bold text-xs backdrop-blur">
            <GiftIcon className="size-3.5 text-violet-500" />
            {t("招待特典", "Invite program")}
          </p>
          <h1 className="mt-3 font-extrabold text-[26px] leading-tight tracking-tight md:mt-4 md:text-4xl">
            {isInvitedGuest
              ? t("Aipictors に招待されました。", "You're invited to Aipictors.")
              : t("友だちを招待して、", "Invite friends,")}
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
              {isInvitedGuest
                ? t(
                    `登録でフリーコイン${rewards.signup.toLocaleString()}枚。`,
                    `Get ${rewards.signup.toLocaleString()} free coins.`,
                  )
                : t("フリーコインをもらおう。", "earn free coins.")}
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed md:text-base">
            {isInvitedGuest
              ? t(
                  "Aipictors は、AIイラストを投稿したり、ブラウザだけで生成したりできるサイトです。登録は無料で、コインは画像の生成に使えます。",
                  "Aipictors is a community for posting AI art and generating images right in your browser. Signing up is free, and coins are used for image generation.",
                )
              : t(
                  `あなたのリンクから登録した友だちに${rewards.signup.toLocaleString()}コイン。友だちが使いはじめると、あなたにも1人あたり最大${maxPerFriend.toLocaleString()}コインが届きます。`,
                  `Friends who sign up from your link get ${rewards.signup.toLocaleString()} coins. When they start creating, you earn up to ${maxPerFriend.toLocaleString()} coins per friend.`,
                )}
          </p>
          <div className="mt-5 md:mt-6">
            {!isEnabled ? (
              <div className="max-w-xl rounded-2xl border bg-background/80 p-4 backdrop-blur md:p-5">
                <p className="font-bold text-base leading-snug">
                  {t(
                    "招待特典は、現在は受け付けていません",
                    "The invite program isn't available right now",
                  )}
                </p>
                <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {t(
                    "紹介リンクからの新しい登録と、特典のコインの付与を止めています。これまでに受け取ったコインはそのまま使えます。",
                    "New sign-ups from invite links and bonus coins are paused. Coins you've already received stay in your balance.",
                  )}
                </p>
              </div>
            ) : authContext.isLoggedIn ? (
              <InviteLinkPanel
                code={state.kind === "done" ? state.summary.code : null}
                isError={state.kind === "error"}
                signupCoins={rewards.signup}
              />
            ) : (
              <InviteGuestPanel
                isLoading={authContext.isLoading}
                hasReferral={hasReferral}
                signupCoins={rewards.signup}
              />
            )}
          </div>
        </div>
      </section>

      <InviteRewardSteps rewards={rewards} isInvitedGuest={isInvitedGuest} />

      {authContext.isLoggedIn && (
        <InviteStats summary={state.kind === "done" ? state.summary : null} />
      )}

      <InviteNoteList
        monthlyLimit={
          state.kind === "done" ? state.summary.monthlyLimit : undefined
        }
      />
    </div>
  )
}
