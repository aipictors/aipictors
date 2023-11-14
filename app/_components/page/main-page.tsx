"use client"

type Props = {
  children: React.ReactNode
}

export const MainPage = (props: Props) => {
  return (
    <div className="overflow-x-hidden pl-4 w-full mx-auto max-w-container.lg">
      {props.children}
    </div>
  )
}
