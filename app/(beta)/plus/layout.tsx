"use client"
import { useContext } from "react"
import { LoadingPage } from "app/components/LoadingPage"
import { LoginPage } from "app/components/LoginPage"
import { AppContext } from "app/contexts/appContext"

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
