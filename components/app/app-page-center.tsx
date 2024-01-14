import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
}

/**
 * デフォルトのページのレイアウト
 * @param props
 * @returns
 */
export const AppPageCenter = (props: Props) => {
  return (
    <main
      className={cn(
        "justify-center items-start mx-auto overflow-x-hidden w-full max-w-4xl",
        "pb-16 pt-2 md:pt-0 px-sm md:px-md",
        "space-y-4 md:space-y-8",
        props.className,
      )}
    >
      {props.children}
    </main>
  )
}
