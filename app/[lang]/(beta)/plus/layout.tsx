"use client"
import { LoadingPage } from "app/components/LoadingPage"
import { LoginPage } from "app/components/LoginPage"
import { AppContext } from "app/contexts/appContext"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const PlusLayout: React.FC<Props> = (props) => {
  const context = useContext(AppContext)

  if (context.isLoading) {
    return <LoadingPage />
  }

  if (context.isNotLoggedIn) {
    return <LoginPage />
  }

  return <>{props.children}</>
}

export default PlusLayout
