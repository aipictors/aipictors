type Props = Readonly<{
  children: React.ReactNode
  announcement?: React.ReactNode
}>

export function AppHeader(props: Props) {
  return (
    <>
      <header className="fixed z-50 w-full">
        <div
          className={
            "flex w-full max-w-none items-center justify-between gap-x-4 border-border/40 bg-background/95 px-4 py-4 backdrop-blur-sm supports-backdrop-filter:bg-background/80 md:px-8"
          }
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
