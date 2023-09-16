"use client"
import React from "react"

import { SettingsNavigation } from "app/(main)/settings/components/SettingsNavigation"

type Props = {
  children: React.ReactNode
}

const SettingsLayout: React.FC<Props> = (props) => {
  return (
    <>
      <SettingsNavigation />
      {props.children}
    </>
  )
}

export default SettingsLayout
