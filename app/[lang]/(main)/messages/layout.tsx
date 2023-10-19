"use client"
import { MessageThreadList } from "app/[lang]/(main)/messages/_components/MessageThreadList"
import MessagesLoading from "app/[lang]/(main)/messages/loading"
import { LoginPage } from "app/_components/LoginPage"
import { AppContext } from "app/_contexts/appContext"
import React, { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const MessagesLayout: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  if (appContext.isLoading) {
    return <MessagesLoading />
  }

  if (appContext.isNotLoggedIn) {
    return <LoginPage />
  }

  return (
    <>
      <MessageThreadList />
      {props.children}
    </>
  )
}

export default MessagesLayout
