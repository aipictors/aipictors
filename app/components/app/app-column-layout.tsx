import { cn } from "~/lib/utils"

type Props = Readonly<{
  className?: string
  isFullWidth?: boolean
  children: React.ReactNode
}>

export function AppColumnLayout (props: Props): React.ReactNode {
  return (
    <div
      className={cn(
        "container",
        "flex items-start",
        "relative gap-x-0 space-x-0 md:gap-x-1",
        { "max-w-none": props.isFullWidth },
      )}
    >
      {props.children}
    </div>
  )
}
