import { cn } from "@/lib/cn"

type Props = Readonly<{
  className?: string
  isFullWidth?: boolean
  children: React.ReactNode
}>

export function AppColumnLayout(props: Props) {
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
