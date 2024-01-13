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
            "flex justify-between items-center",
            "w-full max-w-7xl mx-auto",
            "py-4 px-sm md:px-md gap-x-4",
          )}
        >
          {props.children}
        </div>
      </header>
      <div className={"h-header"} />
    </>
  )
}
