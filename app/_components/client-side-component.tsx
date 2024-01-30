type Props = {
  children: React.ReactNode
}

export default function ClientSideComponent(props: Props) {
  return <>{props.children}</>
}
