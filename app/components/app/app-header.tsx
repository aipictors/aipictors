import { cn } from "~/lib/utils"

type Props = Readonly<{
  children: React.ReactNode
  announcement?: React.ReactNode
  isSmallLeftPadding?: boolean
}>

export function AppHeader (props: Props): React.ReactNode {
  return (
    <>
      <header className="fixed z-30 w-full max-w-[100vw] overflow-x-clip lg:z-30">
        <div
          className={cn(
            "flex w-full min-w-0 flex-wrap items-center justify-between gap-2 bg-none px-3 py-3 md:flex-nowrap md:gap-4 md:px-4 md:py-4",
            props.isSmallLeftPadding ? "lg:pl-8" : "pl-3 lg:pl-54",
          )}
        >
          {props.children}
        </div>
        {props.announcement && props.announcement}
      </header>
      {props.announcement ? (
        <div className={"h-header-with-announcement"} />
      ) : (
        <div className={"h-header"} />
      )}
    </>
  )
}
