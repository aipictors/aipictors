import { useTranslation } from "~/hooks/use-translation"
import {
  REFERRAL_COIN_TTL_DAYS,
  REFERRAL_MONTHLY_LIMIT,
} from "~/lib/referral/referral-rewards"

type Props = {
  monthlyLimit?: number
}

/**
 * 紹介特典の条件
 */
export function InviteNoteList(props: Props) {
  const t = useTranslation()
  const monthlyLimit = props.monthlyLimit ?? REFERRAL_MONTHLY_LIMIT

  const notes = [
    t(
      "対象は、紹介リンクを開いてから新しく登録したアカウントです。すでにあるアカウントは対象になりません。",
      "Only accounts newly created after opening an invite link are eligible. Existing accounts don't count.",
    ),
    t(
      `特典のフリーコインは、受け取ってから${REFERRAL_COIN_TTL_DAYS}日間使えます。`,
      `Bonus free coins are valid for ${REFERRAL_COIN_TTL_DAYS} days after you receive them.`,
    ),
    t(
      "友だちがはじめて生成・投稿したときの特典は、数分ほどで届きます。",
      "The bonus for a friend's first generation or post arrives within a few minutes.",
    ),
    t(
      "プランに加入したときの特典は、友だちのはじめての支払い（自動更新のプラン、または自動更新なしのパス）が完了したときに届きます。無料お試しの開始では届かず、有料に切り替わったときに届きます。",
      "The plan bonus arrives when your friend's first payment for a plan completes. Starting a free trial doesn't count until it converts to a paid plan.",
    ),
    t(
      `紹介した人が特典を受け取れるのは、1か月に${monthlyLimit}人分までです（登録した友だちへの特典は、それを超えても届きます）。`,
      `You can earn rewards for up to ${monthlyLimit} friends per month (your friends still get their sign-up bonus beyond that).`,
    ),
    t(
      "自分自身の紹介、同じ端末や同じ回線からの複数アカウントの登録など、不正と判断した紹介は対象外になり、特典を取り消すことがあります。",
      "Self-invites and multiple accounts from the same device or network are not eligible, and rewards may be revoked.",
    ),
    t(
      "特典の内容は、予告なく変更・終了することがあります。",
      "The program may change or end without notice.",
    ),
  ]

  return (
    <section className="space-y-3">
      <h2 className="font-bold text-base">{t("ご利用の条件", "Terms")}</h2>
      <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground text-sm leading-relaxed">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  )
}
