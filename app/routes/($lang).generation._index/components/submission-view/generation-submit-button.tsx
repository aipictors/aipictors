import { GradientBlueButton } from "~/components/button/gradient-blue-button"
import { CoinIcon } from "~/components/coin-icon"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Loader2Icon } from "lucide-react"
import { useCallback, useRef, useState } from "react"

const formatCoinAmount = (value: number) => {
  return value.toLocaleString()
}

type Props = {
  isLoading: boolean
  isDisabled: boolean
  isCoinSummaryLoading?: boolean
  requestCoinCost: number
  ownedCoinCount: number
  buttonActionCaption: string
  onClick(): void | Promise<void>
}

/**
 * 連打で同じ依頼が二重に飛ばないよう、送信が終わってから押せるようになるまでの間
 */
const CLICK_COOLDOWN_MS = 600

export function GenerationSubmitButton(props: Props) {
  const t = useTranslation()

  const [isSending, setIsSending] = useState(false)

  const isSendingRef = useRef(false)

  /**
   * ボタンクリック時の処理（送信中は押せない）
   */
  const handleClick = useCallback(async () => {
    if (isSendingRef.current) return
    isSendingRef.current = true
    setIsSending(true)
    try {
      await props.onClick()
    } finally {
      setTimeout(() => {
        isSendingRef.current = false
        setIsSending(false)
      }, CLICK_COOLDOWN_MS)
    }
  }, [props.onClick])

  const isBusy = props.isLoading || isSending

  return (
    // プロンプト欄の送信ボタン・ショートカットから押せるように印をつける
    <div data-generation-submit className="contents">
      <GradientBlueButton
        onClick={handleClick}
        className="h-11 w-full min-w-0 md:h-12"
        size={"lg"}
        disabled={isBusy || props.isDisabled}
        isNoBackground={true}
      >
        <div className="flex h-full min-w-0 items-center justify-center gap-2 whitespace-nowrap px-1">
          {isBusy ? (
            <>
              <Loader2Icon className="size-4 shrink-0 animate-spin" />
              <span className="text-sm md:text-base">
                {t("送信中…", "Sending…")}
              </span>
            </>
          ) : (
            <>
              <span className="min-w-0 truncate font-semibold text-base md:text-lg">
                {props.buttonActionCaption}
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums md:text-sm">
                <CoinIcon className="size-3.5 shrink-0 md:size-4" />
                <span>{formatCoinAmount(props.requestCoinCost)}</span>
                <span className="opacity-70">/</span>
                {props.isCoinSummaryLoading ? (
                  <Skeleton className="h-3.5 w-8 rounded-sm bg-white/40" />
                ) : (
                  <span className="opacity-90">
                    {formatCoinAmount(props.ownedCoinCount)}
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </GradientBlueButton>
    </div>
  )
}
