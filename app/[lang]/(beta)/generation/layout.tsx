type Props = {
  children: React.ReactNode
}

const StickersLayout = (props: Props) => {
  return <div className="pb-4 overflow-x-hidden">{props.children}</div>
}

export default StickersLayout
