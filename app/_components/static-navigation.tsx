"use client"

type Props = {
  children: React.ReactNode
}

export const StaticNavigation: React.FC<Props> = (props) => {
  return (
    <div
      className="sticky top-16 overflow-y-auto pb-4 px-4"
      style={{
        height: "calc(100vh - 72px)",
        width: "12rem",
        minWidth: "12rem",
      }}
    >
      {props.children}
    </div>
  )
}
