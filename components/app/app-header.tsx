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
            "flex justify-between items-center w-full container mx-auto py-4 container gap-x-4",
          )}
        >
          {props.children}
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
