"use client"

type Props = {
  children: React.ReactNode
}

export const MainPage: React.FC<Props> = (props) => {
  return (
    <div className="overflow-x-hidden pl-4 w-full mx-auto max-w-container.lg">
      {props.children}
    </div>
  )
}
