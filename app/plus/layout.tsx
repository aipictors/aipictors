"use client"
import { FC, useContext } from "react"
import { MainLoading } from "app/components/MainLoading"
import { MainLogin } from "app/login/components/MainLogin"
import { AppContext } from "contexts/appContext"

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

  return <>{props.children}</>
}

export default PlusLayout
