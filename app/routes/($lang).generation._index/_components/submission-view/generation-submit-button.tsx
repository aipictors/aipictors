import { GradientBlueButton } from "@/_components/button/gradient-blue-button"
import { Loader2Icon } from "lucide-react"

type Props = {
  isLoading: boolean
  isDisabled: boolean
  generatingCount: number
  maxGeneratingCount: number
  buttonActionCaption: string
  onClick(): void
}

export function GenerationSubmitButton(props: Props) {
  const maxGeneratingCount =
    props.maxGeneratingCount <= 0 ? 0 : props.maxGeneratingCount

  return (
    <GradientBlueButton
      onClick={props.onClick}
      className="w-full text-balance"
      size={"lg"}
      disabled={props.isLoading || props.isDisabled}
      isNoBackground={true}
    >
      <div className="flex items-center">
        {props.isLoading
          ? "処理中.."
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
