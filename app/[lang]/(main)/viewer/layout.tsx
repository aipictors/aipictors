"use client"
import React, { useContext } from "react"
import { AppContext } from "app/contexts/appContext"

type Props = {
  children: React.ReactNode
}

const ViewerLayout: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  if (appContext.isLoading) {
    return null
  }

  if (appContext.isNotLoggedIn) {
    return null
  }

  return <>{props.children}</>
}

export default ViewerLayout
