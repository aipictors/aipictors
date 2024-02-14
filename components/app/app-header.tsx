import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
}

export const AppHeader = (props: Props) => {
  return (
    <>
      <header className="fixed z-50 w-full bg-card">
        <div
          className={cn(
            "container max-w-none",
            "flex justify-between items-center w-full py-4 gap-x-4",
          )}
        >
          {props.children}
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
