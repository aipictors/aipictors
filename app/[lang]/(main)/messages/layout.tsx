"use client"
import React, { useContext } from "react"
import { MessageThreadList } from "app/[lang]/(main)/messages/components/MessageThreadList"
import MessagesLoading from "app/[lang]/(main)/messages/loading"
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

  return (
    <>
      <MessageThreadList />
      {props.children}
    </>
  )
}

export default MessagesLayout
