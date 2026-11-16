import { cn } from "~/lib/utils"

type Props = {
  value: string
  max: number
  className?: string
}

/**
 * 入力欄の下に出す「今の文字数/上限」（上限に近づくと色を変える）
 */
export function PostFormCharCount(props: Props) {
  const count = props.value.length
  const isNearLimit = count >= props.max * 0.9

  return (
    <p
      aria-live="polite"
      className={cn(
        "text-right text-muted-foreground text-xs tabular-nums",
        isNearLimit && "text-orange-500",
        count >= props.max && "text-red-500",
        props.className,
      )}
    >
      {count.toLocaleString()}/{props.max.toLocaleString()}
    </p>
  )
}
