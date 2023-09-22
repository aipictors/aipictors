"use client"
import { Divider, HStack } from "@chakra-ui/react"
import { useEffect, useState } from "react" // useState をインポート
import { HomeHeader } from "app/(main)/components/HomeHeader"
import { FooterHome } from "app/components/FooterHome"
import { SensitiveNavigation } from "app/sensitive/components/SensitiveNavigation"
import { Config } from "config"

type Props = {
  children: React.ReactNode
}

const SensitiveLayout: React.FC<Props> = (props) => {
  const [isOpenNavigation, openNavigation] = useState(true)

  useEffect(() => {
    if (Config.isNotClient) return
    const handleResize = () => {
      openNavigation(600 < window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const onOpenNavigation = () => {
    openNavigation(!isOpenNavigation)
  }

  return (
    <>
      <HomeHeader onOpenNavigation={onOpenNavigation} />
      <HStack alignItems={"flex-start"} spacing={0}>
        {isOpenNavigation && <SensitiveNavigation />}
        {props.children}
      </HStack>
      <Divider />
      <FooterHome />
    </>
  )
}

export default SensitiveLayout
