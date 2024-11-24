type Props = Readonly<{
  children: React.ReactNode
  announcement?: React.ReactNode
}>

export function AppHeader(props: Props) {
  return (
    <>
      <header className="fixed z-50 h-full w-full">
        <div
          className={
            "flex h-full w-full max-w-none items-center justify-between gap-x-4 border-border/40 bg-white md:px-8"
          }
        >
          <div className="m-auto text-black">
            {"ただいまメンテナンス中です"}
          </div>
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
