import { cn } from "~/lib/utils"

export function FilterButton(props: {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
  variant?: "underline" | "pill"
}) {
  if (props.variant === "pill") {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={cn(
          "rounded-sm border px-4 py-2 text-sm transition-colors",
          props.isActive
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-muted-foreground hover:text-foreground",
        )}
      >
        {props.children}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "border-b-2 px-1 pb-3 font-medium text-base transition-colors md:text-lg",
        props.isActive
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {props.children}
    </button>
  )
}
