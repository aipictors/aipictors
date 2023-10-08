"use client"
import React, { useContext } from "react"
import MessagesLoading from "app/(main)/messages/loading"
import { AppContext } from "app/contexts/appContext"

type Props = {
  children: React.ReactNode
}

const MessagesLayout: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  if (appContext.isLoading) {
    return <MessagesLoading />
  }

  if (appContext.isNotLoggedIn) {
    return <MessagesLoading />
  }

  return <>{props.children}</>
}

export default MessagesLayout
