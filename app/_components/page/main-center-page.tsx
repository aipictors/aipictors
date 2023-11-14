type Props = {
  children: React.ReactNode
}

export const MainCenterPage = (props: Props) => {
  return (
    <div
      className="w-full flex justify-center px-4"
      style={{ minHeight: "calc(100svh - 72px)" }}
    >
      <div className="overflow-x-hidden w-full max-w-screen-md">
        {props.children}
      </div>
    </div>
  )
}
