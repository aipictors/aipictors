import { useLazyQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2Icon, MegaphoneIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { toWorkPromotionSlotState } from "~/routes/($lang)._main.posts.$post._index/utils/work-promotion-slot"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"

type Props = {
  workId: string
  ownerUserId: string
  /** 公開中の作品だけ宣伝できる */
  accessType?: string
  /** R18・R18G の作品は R18 の枠を使う */
  isSensitive?: boolean
}

const toDateTimeText = (unixSeconds: number) =>
  new Date(unixSeconds * 1000).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  })

/**
 * 自分の作品をプレミアムコインで宣伝枠に出すボタン（プランがなくても使える）。
 * 今から 7 日間トップの「おすすめ作品」の先頭に PR の印付きで出る。枠は全年齢と R18 で 1 作品ずつ
 */
export function WorkPromotionButton(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false)
  const [isCoinPurchaseOpen, setIsCoinPurchaseOpen] = useState(false)
  const [loadStatus, { data, loading, refetch }] = useLazyQuery(
    workPromotionStatusQuery,
    { fetchPolicy: "network-only" },
  )
  const [purchase, { loading: isPurchasing }] = useMutation(
    purchaseWorkPromotionMutation,
  )

  if (authContext.userId !== props.ownerUserId) return null
  if (props.accessType !== undefined && props.accessType !== "PUBLIC") {
    return null
  }

  const slot = props.isSensitive ? "SENSITIVE" : "GENERAL"
  const priceCoins = data?.workPromotionPlan.priceCoins ?? 500
  const days = data?.workPromotionPlan.days ?? 7
  const state = toWorkPromotionSlotState({
    slot,
    workId: props.workId,
    activePromotions: data?.viewerActiveWorkPromotions ?? [],
  })
  const slotLabel =
    slot === "SENSITIVE"
      ? t("R18 の枠", "R18 slot")
      : t("全年齢の枠", "All-ages slot")

  const onPurchase = async () => {
    try {
      const result = await purchase({
        variables: { input: { workId: props.workId } },
      })
      const endsAt = result.data?.purchaseWorkPromotion.endsAt
      toast(
        t(
          `宣伝枠に出しました（${endsAt ? toDateTimeText(endsAt) : `${days}日後`} まで）`,
          "Your work is now promoted",
        ),
      )
      setIsOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message.includes("プレミアムコインが足りません")) {
        setIsCoinPurchaseOpen(true)
        return
      }
      toast(message || t("宣伝枠に出せませんでした", "Failed to promote"))
      void refetch()
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        className="space-x-2"
        aria-label={t("宣伝する", "Promote")}
        onClick={() => {
          setIsOpen(true)
          void loadStatus()
        }}
      >
        <MegaphoneIcon width={16} />
        <p>{t("宣伝する", "Promote")}</p>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("この作品を宣伝する", "Promote this work")}
            </DialogTitle>
            <DialogDescription>
              {t(
                `プレミアムコイン ${priceCoins.toLocaleString()} 枚で、今から${days}日間この作品を宣伝枠に出せます。プランに入っていなくても使えます。`,
                `Promote this work for ${days} days for ${priceCoins.toLocaleString()} premium coins. No plan needed.`,
              )}
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>
              {t(
                "トップの「おすすめ作品」の一覧の先頭に、PR の印付きで表示されます",
                "Shown first in Recommended works on the home page, with a PR mark",
              )}
            </li>
            <li>
              {t(
                "作品ページに宣伝の帯と関連リンクへのボタン、一覧のサムネイルに PR のしるしが付きます",
                "Your work page gets a promotion banner and link button, and thumbnails get a PR mark",
              )}
            </li>
            <li>
              {t(
                "宣伝できるのは全年齢と R18 でそれぞれ 1 作品ずつです。終わると次の作品を出せます",
                "One work each for all-ages and R18 at a time. You can promote another when it ends",
              )}
            </li>
          </ul>
          <WorkPromotionBalance />
          <p className="text-muted-foreground text-xs">
            {t(
              "無料コインは使えません。一度出すと取り消せず、コインは戻りません。",
              "Free coins can't be used. Once started, it can't be canceled or refunded.",
            )}
          </p>
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2Icon className="size-5 animate-spin" />
            </div>
          ) : state.kind === "THIS_WORK" ? (
            <p className="rounded-lg bg-muted p-3 text-sm">
              {t(
                `この作品は宣伝中です（${toDateTimeText(state.endsAt)} まで）`,
                `This work is being promoted until ${toDateTimeText(state.endsAt)}`,
              )}
            </p>
          ) : state.kind === "OTHER_WORK" ? (
            <p className="rounded-lg bg-muted p-3 text-sm">
              {t(
                `${slotLabel}は別の作品で使っています（${toDateTimeText(state.endsAt)} まで）。終わってから出せます`,
                `Your ${slotLabel} is in use until ${toDateTimeText(state.endsAt)}`,
              )}
            </p>
          ) : (
            <Button
              className="h-11 w-full gap-1.5 rounded-full font-bold"
              disabled={isPurchasing}
              onClick={() => void onPurchase()}
            >
              {isPurchasing ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <>
                  <PremiumCoinIcon className="size-5" />
                  {t(
                    `${priceCoins.toLocaleString()}枚で${days}日間宣伝する`,
                    `Promote for ${days} days (${priceCoins.toLocaleString()} coins)`,
                  )}
                </>
              )}
            </Button>
          )}
        </DialogContent>
      </Dialog>
      {isCoinPurchaseOpen && (
        <WorkPromotionCoinPurchase
          onClose={() => setIsCoinPurchaseOpen(false)}
        />
      )}
    </>
  )
}

/** ダイアログを開いたときだけ残高を読む */
function WorkPromotionBalance() {
  const t = useTranslation()
  const { balance } = useCoinBalance()
  if (balance === null) return null
  return (
    <p className="flex items-center gap-1 text-sm">
      <PremiumCoinIcon className="size-4" />
      {t(
        `プレミアムコインの残り ${balance.premiumCoinsBalance.toLocaleString()} 枚`,
        `${balance.premiumCoinsBalance.toLocaleString()} premium coins left`,
      )}
    </p>
  )
}

/** 足りないときのコイン購入（開くときだけ残高を読む） */
function WorkPromotionCoinPurchase(props: { onClose: () => void }) {
  const { balance } = useCoinBalance()
  return (
    <PurchasePremiumCoinsDialog
      currentBalance={balance?.premiumCoinsBalance ?? 0}
      open
      onOpenChange={(open) => {
        if (!open) props.onClose()
      }}
      hideTrigger
    />
  )
}

const workPromotionStatusQuery = graphql(
  `query WorkPromotionStatus {
    workPromotionPlan {
      priceCoins
      days
    }
    viewerActiveWorkPromotions {
      slot
      workId
      endsAt
      isPurchased
    }
  }`,
)

const purchaseWorkPromotionMutation = graphql(
  `mutation PurchaseWorkPromotion($input: PurchaseWorkPromotionInput!) {
    purchaseWorkPromotion(input: $input) {
      slot
      workId
      endsAt
    }
  }`,
)
