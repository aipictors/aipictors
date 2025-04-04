import { Button } from "~/components/ui/button"
import { CircleCheckIcon, CircleIcon } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  onClick(): void
  isChecked: boolean
  text: string
  subText: string
  className?: string
  isShowCheckbox?: boolean
}

export function GenerationExtrasToggleButton(props: Props) {
  // ボタンのスタイルを動的に変更するためのクラス名を決定する
  const buttonClass = props.isChecked
    ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white"
    : "bg-gray-700 text-gray-300"

  return (
    <Button
      onClick={props.onClick}
      className={cn(
        buttonClass,
        "relative h-10 w-full text-balance rounded-lg px-4 py-2 shadow-md transition duration-300 ease-in-out dark:hover:bg-primary/40",
        props.className,
      )}
      size="lg"
    >
      {props.isShowCheckbox && props.isChecked && (
        <div className="absolute top-0 left-1 md:top-1">
          <CircleCheckIcon className="w-4 md:w-6" />
        </div>
      )}
      {props.isShowCheckbox && !props.isChecked && (
        <div className="absolute top-0 left-1 md:top-1">
          <CircleIcon className="w-4 md:w-6" />
        </div>
      )}

      {props.subText ? (
        <div>
          <div className="flex items-center justify-center">{props.text}</div>
          <div className="flex items-center justify-center text-xs">
            {props.subText}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">{props.text}</div>
      )}
    </Button>
  )
}
