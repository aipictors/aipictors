import { type ComponentProps, lazy, Suspense, useState } from "react"
import type { PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"

const Dialog = lazy(() =>
  import(
    "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"
  ).then((module) => ({ default: module.PurchasePremiumCoinsDialog })),
)

type Props = ComponentProps<typeof PurchasePremiumCoinsDialog> & {
  open: boolean
}

/**
 * コインの購入ダイアログを、最初に開くときに読み込む。トリガーのない使い方（open で開く）のためのもの。
 * 閉じるときのアニメーションが残るように、一度開いたら出したままにする
 */
export function LazyPurchasePremiumCoinsDialog (props: Props) {
  const [hasOpened, setHasOpened] = useState(false)

  if (props.open && !hasOpened) {
    setHasOpened(true)
  }

  if (!props.open && !hasOpened) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <Dialog {...props} />
    </Suspense>
  )
}
