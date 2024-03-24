"use client"

import { MessageThreadList } from "@/app/[lang]/(main)/messages/_components/message-thread-list"
import MessagesLoading from "@/app/[lang]/(main)/messages/loading"
import { LoginPage } from "@/app/_components/page/login-page"
import { AuthContext } from "@/app/_contexts/auth-context"
import type React from "react"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const MessagesLayout = (props: Props) => {
  const appContext = useContext(AuthContext)

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
