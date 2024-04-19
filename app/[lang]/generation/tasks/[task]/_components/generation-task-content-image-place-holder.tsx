import { Skeleton } from "@/_components/ui/skeleton"
import { Loader2Icon } from "lucide-react"

type Props = {
  className?: string
}

/**
 * 履歴一覧の履歴シートの中に表示する履歴内容
 * @param props
 * @returns
 */
export function GenerationTaskContentImagePlaceHolder(props: Props) {
  return (
    <Skeleton
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`${props.className} relative`}
    >
      <Loader2Icon
        className={
          "dark:black absolute top-[50%] left-[48%] w-8 animate-spin text-black dark:text-white"
        }
      />
    </Skeleton>
  )
}
