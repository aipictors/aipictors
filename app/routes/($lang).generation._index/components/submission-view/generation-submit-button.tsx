import { GradientBlueButton } from "~/components/button/gradient-blue-button"
import { Loader2Icon } from "lucide-react"
import { useState, useCallback } from "react"

type Props = {
  isLoading: boolean
  isDisabled: boolean
  generatingCount: number
  maxGeneratingCount: number
  buttonActionCaption: string
  onClick(): void
}

export function GenerationSubmitButton(props: Props) {
  const [isClickDisabled, setIsClickDisabled] = useState(false)

  const maxGeneratingCount =
    props.maxGeneratingCount <= 0 ? 0 : props.maxGeneratingCount

  /**
   * ボタンクリック時の処理（連打防止機能付き）
   */
  const handleClick = useCallback(async () => {
    if (isClickDisabled) return

    // 連打防止のため3秒間ボタンを無効化
    setIsClickDisabled(true)

    try {
      await props.onClick()
    } finally {
      // 3秒後にボタンを再有効化
      setTimeout(() => {
        setIsClickDisabled(false)
      }, 3000)
    }
  }, [props.onClick, isClickDisabled])

  return (
    <GradientBlueButton
      onClick={handleClick}
      className="w-full text-balance"
      size={"lg"}
      disabled={props.isLoading || props.isDisabled || isClickDisabled}
      isNoBackground={true}
    >
      <div className="flex items-center">
        {props.isLoading
          ? "処理中.."
          : isClickDisabled
            ? "少々お待ちください..."
            : `${props.buttonActionCaption}(${props.generatingCount}/${maxGeneratingCount})`}
        {props.generatingCount > 0 && (
          <Loader2Icon
            className={
              "dark:black ml-2 w-4 animate-spin text-white dark:text-black"
            }
          />
        )}
      </div>
    </GradientBlueButton>
  )
}
