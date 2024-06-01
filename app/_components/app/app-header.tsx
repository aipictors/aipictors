import { cn } from "@/_lib/cn"

type Props = Readonly<{
  children: React.ReactNode
}>

export function AppHeader(props: Props) {
  return (
    <>
      <header className="fixed z-50 w-full bg-card">
        <div
          className={cn(
            "container max-w-none",
            "flex w-full items-center justify-between gap-x-4 py-4",
          )}
        >
          {props.children}
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
