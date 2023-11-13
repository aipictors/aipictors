"use client"

type Props = {
  children: React.ReactNode
}

export const MainCenterPage: React.FC<Props> = (props) => {
  return (
    <div className="overflow-x-hidden px-4 ml-auto mr-auto py-0 w-full max-w-screen-md pb-16">
      {props.children}
    </div>
  )
}
