"use client"

type Props = {
  children: React.ReactNode
}

export const MainCenterPage: React.FC<Props> = (props) => {
  return (
    <div className="w-full flex justify-center pb-16 px-4">
      <div className="overflow-x-hidden w-full max-w-screen-md">
        {props.children}
      </div>
    </div>
  )
}
