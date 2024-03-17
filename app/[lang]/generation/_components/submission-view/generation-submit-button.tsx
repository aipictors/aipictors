import { GlowingGradientBorderButton } from "@/app/_components/button/glowing-gradient-border-button"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
import { useTheme } from "next-themes"

type Props = {
  isLoading: boolean
  isDisabled: boolean
  generatingCount: number
  maxGeneratingCount: number
  buttonActionCaption: string
  onClick(): void
}

export function GenerationSubmitButton(props: Props) {
  const { theme } = useTheme()

  return (
    <GlowingGradientBorderButton
      onClick={props.onClick}
      className="w-full text-balance"
      size={"lg"}
      disabled={props.isLoading || props.isDisabled}
      children={
        <div className="flex items-center">
          {props.isLoading
            ? "処理中.."
            : `${props.buttonActionCaption}(${props.generatingCount}/${props.maxGeneratingCount})`}
          {props.generatingCount > 0 && (
            <Loader2Icon
              color={theme === "light" ? "white" : "black"}
              className={"dark:black ml-2 w-4 animate-spin"}
            />
          )}
        </div>
      }
    />
  )
}
