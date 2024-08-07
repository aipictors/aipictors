import { cn } from "~/lib/cn"

type Props = Readonly<{
  children: React.ReactNode
}>

export function AppHeader(props: Props) {
  return (
    <>
      <header className="fixed z-50 w-full">
        <div
          className={cn(
            "max-w-none px-4 md:px-8",
            "flex w-full items-center justify-between gap-x-4 py-4",
            "border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          )}
        >
          {props.children}
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
