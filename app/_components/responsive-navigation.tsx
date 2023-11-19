type Props = {
  children: React.ReactNode
}

export const ResponsiveNavigation = (props: Props) => {
  return (
    <nav
      className="sticky overflow-y-auto pb-4 pl-4 hidden md:block"
      style={{
        top: "72px",
        height: "calc(100svh - 72px)",
        width: "12rem",
        minWidth: "12rem",
      }}
    >
      {props.children}
    </nav>
  )
}
