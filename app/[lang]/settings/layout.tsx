"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { SettingsRouteList } from "@/app/[lang]/settings/_components/settings-route-list"
import { ResponsiveNavigation } from "@/app/_components/responsive-navigation"
import { AppContext } from "@/app/_contexts/app-context"
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
      <BetaHeader title={"設定"} />
      <div className="flex items-start space-x-0">
        <ResponsiveNavigation>
          <SettingsRouteList />
        </ResponsiveNavigation>
        {props.children}
      </div>
    </>
  )
}

export default SettingsLayout
