"use client"
import type { FC} from "react";
import { useContext } from "react"
import { FooterHome } from "app/components/FooterHome"
import { MainLoading } from "app/components/MainLoading"
import { MainLogin } from "app/components/MainLogin"
import { AppContext } from "app/contexts/appContext"

type Props = {
  children: React.ReactNode
}

const PlusLayout: FC<Props> = (props) => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <MainLoading />
  }

  if (context.isNotLoggedIn) {
    return <MainLogin />
  }

  return (
    <>
      {props.children}
      <FooterHome />
    </>
  )
}

export default PlusLayout
