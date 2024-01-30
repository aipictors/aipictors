type Props = {
  className?: string
  children: React.ReactNode
}

export const AppColumnLayout = (props: Props) => {
  return (
    <div className="flex items-start space-x-0 w-full">{props.children}</div>
  )
}
