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
    <Button
      onClick={props.onClick}
      className="w-full"
      size={"lg"}
      disabled={props.isLoading || props.isDisabled}
    >
      <div className="flex items-center">
        {props.isLoading
          ? "処理中.."
          : `${props.buttonActionCaption}する(${props.generatingCount}/${props.maxGeneratingCount})`}
        {props.generatingCount > 0 && (
          <Loader2Icon
            color={theme === "light" ? "white" : "black"}
            className={"ml-2 w-4 animate-spin dark:black"}
          />
        )}
      </div>
    </Button>
  )
}
