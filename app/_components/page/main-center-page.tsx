"use client"

type Props = {
  children: React.ReactNode
}

export const MainCenterPage: React.FC<Props> = (props) => {
  return (
    <div
      className="w-full min-h-full flex justify-center px-4"
      style={{ height: "calc(100svh - 72px)" }}
    >
      <div className="overflow-x-hidden w-full max-w-screen-md min-h-full">
        {props.children}
      </div>
    </div>
  )
}
