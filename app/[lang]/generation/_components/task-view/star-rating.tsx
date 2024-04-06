import { Button } from "@/_components/ui/button"
import { cn } from "@/_lib/utils"
import { Loader2Icon, StarIcon } from "lucide-react"
import { useCallback, useEffect } from "react"

type Props = {
  value: number
  className?: string
  disabled?: boolean
  isLoading?: boolean
  onChange(value: number): void
}

/**
 * レーティング
 * @param props
 * @returns
 */
export const StarRating = (props: Props) => {
  /**
   * キー入力でレーティング変更できるようにする
   */
  const handleNumberKeyDown = useCallback((event: { keyCode: number }) => {
    // 入力欄やテキストエリアにフォーカスしている場合は何もしない
    const tagName = document.activeElement?.tagName.toLowerCase()
    if (tagName === "input" || tagName === "textarea") {
      return
    }

    if (event.keyCode === 49) {
      if (props.value === 1) {
        props.onChange(0)
        return
      }
      props.onChange(1)
    }
    if (event.keyCode === 50) {
      if (props.value === 2) {
        props.onChange(0)
        return
      }
      props.onChange(2)
    }
    if (event.keyCode === 51) {
      if (props.value === 3) {
        props.onChange(0)
        return
      }
      props.onChange(3)
    }
    if (event.keyCode === 52) {
      if (props.value === 4) {
        props.onChange(0)
        return
      }
      props.onChange(4)
    }
    if (event.keyCode === 53) {
      if (props.value === 5) {
        props.onChange(0)
        return
      }
      props.onChange(5)
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleNumberKeyDown, false)
      return () => {
        document.removeEventListener("keydown", handleNumberKeyDown)
      }
    }
  }, [])

  return (
    <div className={props.className}>
      <Button
        disabled={props.disabled}
        aria-label={"お気に入り"}
        size={"icon"}
        variant="ghost"
        onClick={() => {
          props.value === 1 ? props.onChange(0) : props.onChange(1)
        }}
      >
        {props.isLoading ? (
          <Loader2Icon className="h-6 w-6 animate-spin" />
        ) : (
          <StarIcon className={cn(0 < props.value && "fill-yellow-500")} />
        )}
      </Button>
      <Button
        disabled={props.disabled}
        aria-label={"お気に入り"}
        size={"icon"}
        variant="ghost"
        onClick={() => {
          props.value === 2 ? props.onChange(0) : props.onChange(2)
        }}
      >
        {props.isLoading ? (
          <Loader2Icon className="h-6 w-6 animate-spin" />
        ) : (
          <StarIcon className={cn(1 < props.value && "fill-yellow-500")} />
        )}
      </Button>
      <Button
        disabled={props.disabled}
        aria-label={"お気に入り"}
        size={"icon"}
        variant="ghost"
        onClick={() => {
          props.value === 3 ? props.onChange(0) : props.onChange(3)
        }}
      >
        {props.isLoading ? (
          <Loader2Icon className="h-6 w-6 animate-spin" />
        ) : (
          <StarIcon className={cn(2 < props.value && "fill-yellow-500")} />
        )}
      </Button>
      <Button
        disabled={props.disabled}
        aria-label={"お気に入り"}
        size={"icon"}
        variant="ghost"
        onClick={() => {
          props.value === 4 ? props.onChange(0) : props.onChange(4)
        }}
      >
        {props.isLoading ? (
          <Loader2Icon className="h-6 w-6 animate-spin" />
        ) : (
          <StarIcon className={cn(3 < props.value && "fill-yellow-500")} />
        )}
      </Button>
      <Button
        disabled={props.disabled}
        aria-label={"お気に入り"}
        size={"icon"}
        variant="ghost"
        onClick={() => {
          props.value === 5 ? props.onChange(0) : props.onChange(5)
        }}
      >
        {props.isLoading ? (
          <Loader2Icon className="h-6 w-6 animate-spin" />
        ) : (
          <StarIcon className={cn(4 < props.value && "fill-yellow-500")} />
        )}
      </Button>
    </div>
  )
}
