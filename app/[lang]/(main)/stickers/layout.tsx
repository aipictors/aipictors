"use client"

type Props = {
  children: React.ReactNode
  modal: React.ReactNode
}

const StickersLayout = (props: Props) => {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  )
}

export default StickersLayout
