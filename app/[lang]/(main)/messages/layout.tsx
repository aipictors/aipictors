"use client"

import { MessageThreadList } from "@/app/[lang]/(main)/messages/_components/message-thread-list"
import MessagesLoading from "@/app/[lang]/(main)/messages/loading"
import { LoginPage } from "@/app/_components/page/login-page"
import { AppContext } from "@/app/_contexts/app-context"
import React, { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const MessagesLayout = (props: Props) => {
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
