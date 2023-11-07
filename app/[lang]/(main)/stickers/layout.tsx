"use client"

type Props = {
  children: React.ReactNode
  modal?: React.ReactNode
}

const StickersLayout: React.FC<Props> = (props) => {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  )
}

export default StickersLayout
