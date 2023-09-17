"use client"
import { FC, useContext } from "react"
import { MainLoading } from "app/components/MainLoading"
import { MainLogin } from "app/components/MainLogin"
import { AppContext } from "app/contexts/appContext"

type Props = {
  children: React.ReactNode
}

const HomeLayout: FC<Props> = (props) => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <MainLoading />
  }

  if (context.isNotLoggedIn) {
    return <MainLogin />
  }

  return <>{props.children}</>
}

export default HomeLayout
