import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

type Props = {
  className?: string
}

export const AppSpinnerIcon = (props: Props) => {
  return <Loader2Icon className={cn("h-8 w-8 animate-spin", props.className)} />
}
