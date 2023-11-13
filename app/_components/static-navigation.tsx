"use client"

type Props = {
  children: React.ReactNode
}

export const StaticNavigation: React.FC<Props> = (props) => {
  return (
    <div className="sticky top-16 h-calc(100vh - 72px) min-w-12rem overflow-y-auto pb-4 pl-4">
      {props.children}
    </div>
  )
}
