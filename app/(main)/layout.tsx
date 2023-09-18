"use client"
import { Divider, HStack } from "@chakra-ui/react"
import { useEffect, useState } from "react" // useState をインポート
import { HomeHeader } from "app/(main)/components/HomeHeader"
import { HomeNavigation } from "app/(main)/components/HomeNavigation"
import { FooterHome } from "app/components/FooterHome"

type Props = {
  children: React.ReactNode
}

const MainLayout: React.FC<Props> = (props) => {
  const [isHomeNavigationVisible, setHomeNavigationVisible] = useState(true)

  const changeHomeNavigationState = () => {
    setHomeNavigationVisible(!isHomeNavigationVisible)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setHomeNavigationVisible(false)
      } else {
        setHomeNavigationVisible(true)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <HomeHeader changeHomeNavigationState={changeHomeNavigationState} />
      <HStack alignItems={"flex-start"} spacing={0}>
        {isHomeNavigationVisible && <HomeNavigation />} {props.children}
      </HStack>
      <Divider />
      <FooterHome />
    </>
  )
}

export default MainLayout
