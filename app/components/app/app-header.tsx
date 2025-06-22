import { cn } from "~/lib/utils"

type Props = Readonly<{
  children: React.ReactNode
  announcement?: React.ReactNode
  isSmallLeftPadding?: boolean
}>

export function AppHeader(props: Props) {
  return (
    <>
      <header className="fixed z-30 w-full max-w-[100vw] lg:z-30">
        <div
          className={cn(
            "flex w-full items-center justify-between space-x-4 bg-none px-4 py-4",
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
