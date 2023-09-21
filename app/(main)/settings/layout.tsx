"use client"
import React, { useContext } from "react"
import { SettingsNavigation } from "app/(main)/settings/components/SettingsNavigation"
import { AppContext } from "app/contexts/appContext"

type Props = {
  children: React.ReactNode
}

const SettingsLayout: React.FC<Props> = (props) => {
  const appContext = useContext(AppContext)

  if (appContext.isLoading) {
    return null
  }

  if (appContext.isNotLoggedIn) {
    return null
  }

  return (
    <>
      <SettingsNavigation />
      {props.children}
    </>
  )
}

export default SettingsLayout
