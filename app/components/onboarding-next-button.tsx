import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  type?: "button" | "submit"
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  children: React.ReactNode
}>

/**
 * 登録の手順の「次へ」。押せるようになったら色が付く
 */
export function OnboardingNextButton(props: Props): React.ReactNode {
  return (
    <Button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={cn(
        "group h-12 w-full gap-2 rounded-xl font-bold text-base transition-all",
        !props.disabled &&
          "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-teal-500/30 hover:opacity-95 hover:shadow-teal-500/45",
      )}
    >
      {props.isLoading ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <>
          {props.children}
          {!props.disabled && (
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </>
      )}
    </Button>
  )
}
