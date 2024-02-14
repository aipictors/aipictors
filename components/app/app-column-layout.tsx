type Props = {
  className?: string
  isWidthFull?: boolean
  children: React.ReactNode
}

export const AppColumnLayout = (props: Props) => {
  return (
    <div
      className={`flex items-start ${
        props.isWidthFull ? "max-w-[100vw]" : "container w-full"
      } space-x-0 container mx-auto gap-x-4 relative`}
    >
      {props.children}
    </div>
  )
}
