import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { AccountRouteList } from "@/[lang]/account/_components/account-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { AuthContext } from "@/_contexts/auth-context"
import type React from "react"
import { useContext } from "react"

type Props = {
  children: React.ReactNode
}

const SettingsLayout = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return null
  }

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <>
      <HomeHeader title={"アカウント"} />
      <AppColumnLayout>
        <AppAside>
          <AccountRouteList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
    </>
  )
}

export default SettingsLayout
