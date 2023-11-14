"use client"

type Props = {
  children?: React.ReactNode
}

export const PlaceholderPage = (props: Props) => {
  return (
    <div className="p-4 h-calc(100vh - 72px) w-full flex justify-center items-center">
      <div>
        <p>{props.children ?? "Placeholder"}</p>
      </div>
    </div>
  )
}
