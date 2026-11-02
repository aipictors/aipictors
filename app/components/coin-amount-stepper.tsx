import { Minus, Plus } from "lucide-react"
import type React from "react"
import { useEffect, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { stepCoinAmount } from "~/utils/step-coin-amount"

type Props = {
  /** 数字の文字列。空は 0 枚 */
  value: string
  /** 持っているコインの枚数。これより多くは選べない */
  max: number
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

/** 押し続けたと見なすまでの時間と、そのあと増減する間隔 */
const HOLD_DELAY_MS = 400
const HOLD_INTERVAL_MS = 100

/** 押し続けるほど大きく動かす（残高が多くても指を離さず届くように） */
const toHoldStep = (tick: number) => {
  if (tick < 10) return 1
  if (tick < 30) return 10
  return 50
}

/**
 * コインの枚数を − と ＋ で増減する。押し続けると連続で動き、数字は直接入力もできる
 */
export function CoinAmountStepper(props: Props) {
  const t = useTranslation()
  const amount = Number(props.value) || 0
  const amountRef = useRef(amount)
  amountRef.current = amount
  const maxRef = useRef(props.max)
  maxRef.current = props.max
  const onChangeRef = useRef(props.onChange)
  onChangeRef.current = props.onChange
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 押し続けて動かしたあとの click で、もう 1 枚動かないようにする
  const didHoldRef = useRef(false)

  const stopHold = () => {
    if (holdTimerRef.current !== null) clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
  }

  useEffect(() => stopHold, [])

  const stepBy = (direction: 1 | -1, step: number) => {
    const next = stepCoinAmount(
      amountRef.current,
      direction,
      step,
      maxRef.current,
    )
    amountRef.current = next
    onChangeRef.current(String(next))
    return next
  }

  const startHold = (direction: 1 | -1) => {
    stopHold()
    didHoldRef.current = false
    let tick = 0
    const repeat = () => {
      didHoldRef.current = true
      const next = stepBy(direction, toHoldStep(tick))
      tick += 1
      if (next <= 0 || next >= maxRef.current) {
        // 端まで行くとボタンが無効になり、指を離しても click が来ない
        didHoldRef.current = false
        holdTimerRef.current = null
        return
      }
      holdTimerRef.current = setTimeout(repeat, HOLD_INTERVAL_MS)
    }
    holdTimerRef.current = setTimeout(repeat, HOLD_DELAY_MS)
  }

  const cancelHold = () => {
    stopHold()
    didHoldRef.current = false
  }

  const toStepButtonProps = (direction: 1 | -1) => ({
    type: "button" as const,
    variant: "outline" as const,
    size: "icon" as const,
    className:
      "size-11 shrink-0 touch-manipulation select-none rounded-full bg-background",
    onPointerDown: () => startHold(direction),
    onPointerUp: stopHold,
    onPointerLeave: cancelHold,
    onPointerCancel: cancelHold,
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    onClick: () => {
      stopHold()
      if (didHoldRef.current) {
        didHoldRef.current = false
        return
      }
      stepBy(direction, 1)
    },
  })

  return (
    <div className={cn("flex items-center gap-2", props.className)}>
      <Button
        {...toStepButtonProps(-1)}
        aria-label={t("1 枚減らす", "Remove one coin")}
        title={t("1 枚減らす（長押しで連続）", "Remove one (hold to repeat)")}
        disabled={props.disabled || amount <= 0}
      >
        <Minus className="size-5" />
      </Button>
      <Input
        aria-label={t("枚数", "Amount")}
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={amount === 0 ? "" : String(amount)}
        disabled={props.disabled}
        onChange={(event) => {
          const numeric = Number.parseInt(
            event.target.value.replaceAll(/[^0-9]/g, ""),
            10,
          )
          props.onChange(
            Number.isNaN(numeric)
              ? ""
              : String(Math.min(numeric, Math.max(0, props.max))),
          )
        }}
        className="h-11 min-w-0 flex-1 rounded-full bg-background px-2 text-center font-bold text-base tabular-nums"
      />
      <Button
        {...toStepButtonProps(1)}
        aria-label={t("1 枚増やす", "Add one coin")}
        title={t("1 枚増やす（長押しで連続）", "Add one (hold to repeat)")}
        disabled={props.disabled || amount >= props.max}
      >
        <Plus className="size-5" />
      </Button>
    </div>
  )
}
