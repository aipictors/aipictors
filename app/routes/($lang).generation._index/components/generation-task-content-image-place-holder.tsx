import { Skeleton } from "~/components/ui/skeleton"
import { Loader2Icon } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  className?: string
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴内容
 */
export function GenerationTaskContentImagePlaceHolder (props: Props) {
  return (
    <Skeleton className={cn(props.className, "relative")}>
      <Loader2Icon
        className={cn(
          "absolute top-[50%] left-[48%] w-8 animate-spin text-black dark:text-white",
        )}
      />
    </Skeleton>
  )
}
