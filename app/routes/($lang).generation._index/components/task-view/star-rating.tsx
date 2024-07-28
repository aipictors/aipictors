import { Button } from "@/components/ui/button"
import { cn } from "@/lib/cn"
import { Loader2Icon, StarIcon } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"

type Props = {
  value: number
  className?: string
  disabled?: boolean
  isLoading?: boolean
  onChange(value: number): void
}

/**
 * レーティング
 */
export const StarRating = (props: Props) => {
  const starOneRef = useRef<HTMLButtonElement>(null)
  const starTwoRef = useRef<HTMLButtonElement>(null)
  const starThreeRef = useRef<HTMLButtonElement>(null)
  const starFourRef = useRef<HTMLButtonElement>(null)
  const starFiveRef = useRef<HTMLButtonElement>(null)

  /**
   * キー入力でレーティング変更できるようにする
   */
  const handleNumberKeyDown = useCallback((event: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase()
    if (tagName === "input" || tagName === "textarea") {
      return
    }

    switch (event.keyCode) {
      case 49: // Key '1'
        starOneRef.current?.click()
        break
      case 50: // Key '2'
        starTwoRef.current?.click()
        break
      case 51: // Key '3'
        starThreeRef.current?.click()
        break
      case 52: // Key '4'
        starFourRef.current?.click()
        break
      case 53: // Key '5'
        starFiveRef.current?.click()
        break
      default:
        break
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
      {[starOneRef, starTwoRef, starThreeRef, starFourRef, starFiveRef].map(
        (ref, index) => (
          <Button
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            ref={ref}
            disabled={props.disabled}
            aria-label={`お気に入り ${index + 1}`}
            size="icon"
            variant="ghost"
            onClick={() => {
              const newRating = index + 1
              props.onChange(props.value === newRating ? 0 : newRating)
            }}
          >
            {props.isLoading ? (
              <Loader2Icon className="h-6 w-6 animate-spin" />
            ) : (
              <StarIcon
                className={cn(props.value > index && "fill-yellow-500")}
              />
            )}
          </Button>
        ),
      )}
    </div>
  )
}
