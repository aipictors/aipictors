import { useContext } from "react"
import { SidebarContext } from "~/contexts/sidebar-context"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  children: React.ReactNode
  announcement?: React.ReactNode
  isSmallLeftPadding?: boolean
}>

export function AppHeader(props: Props): React.ReactNode {
  const sidebarContext = useContext(SidebarContext)

  const leftPaddingClass = (() => {
    if (props.isSmallLeftPadding) return "md:pl-4 lg:pl-8"

    const sidebarState = sidebarContext?.sidebarState

    // Sidebar widths (see AppContents): expanded=232px, collapsed=80px
    // Add extra breathing room so header items never feel cramped/overlapped.
    if (sidebarState === "collapsed") return "md:pl-[136px]"
    if (sidebarState === "minimal") return "md:pl-14"
    return "md:pl-[288px]"
  })()

  return (
    <>
      <header className="fixed z-50 w-full max-w-[100vw] overflow-x-clip">
        <div
          className={cn(
            "flex w-full min-w-0 flex-wrap items-center justify-between gap-2 bg-none px-3 py-3 md:flex-nowrap md:gap-4 md:px-4 md:py-4",
            "pl-3",
            leftPaddingClass,
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
