import { cn } from "@/_lib/utils"

type Props = {
  className?: string
  isFullWidth?: boolean
  children: React.ReactNode
}

export const AppColumnLayout = (props: Props) => {
  return (
    <div
      className={cn(
        "container",
        "flex items-start",
        "relative gap-x-0 space-x-0 md:gap-x-4",
        { "max-w-none": props.isFullWidth },
      )}
    >
      {props.children}
    </div>
  )
}
