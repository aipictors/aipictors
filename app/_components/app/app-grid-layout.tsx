import { cn } from "@/_lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

export const AppGridLayout = (props: Props) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 md:gap-4",
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
