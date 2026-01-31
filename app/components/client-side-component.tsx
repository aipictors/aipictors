type Props = {
  children: React.ReactNode
}

export default function ClientSideComponent (props: Props): React.ReactNode {
  return <>{props.children}</>
}
