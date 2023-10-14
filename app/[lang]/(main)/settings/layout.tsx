"use client"
import { SettingsNavigation } from "app/[lang]/(main)/settings/components/SettingsNavigation"
import { AppContext } from "app/contexts/appContext"
import React, { useContext } from "react"

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
