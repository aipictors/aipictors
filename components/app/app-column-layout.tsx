type Props = {
  className?: string
  isMaxWidthNone?: boolean
  children: React.ReactNode
}

export const AppColumnLayout = (props: Props) => {
  return (
    <div
      className={`flex items-start ${
        props.isMaxWidthNone ? "max-w-none" : "w-full"
      } space-x-0 container mx-auto gap-x-4 relative`}
    >
      {props.children}
    </div>
  )
}
