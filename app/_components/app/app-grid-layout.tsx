import { cn } from "@/_lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

export const AppGridLayout = (props: Props) => {
  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-4",
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
