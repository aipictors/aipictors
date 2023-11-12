"use client"

import { Divider, HStack } from "@chakra-ui/react"
// useState をインポート
import { HomeHeader } from "app/[lang]/(main)/_components/home-header"
import { SensitiveNavigation } from "app/[lang]/sensitive/_components/sensitive-navigation"
import { HomeFooter } from "app/_components/home-footer"
import { useNavigation } from "app/_hooks/use-navigation"

type Props = {
  children: React.ReactNode
}

const SensitiveLayout: React.FC<Props> = (props) => {
  const [isOpenNavigation, openNavigation] = useNavigation()

  return (
    <>
      <HomeHeader onOpenNavigation={openNavigation} />
      <HStack alignItems={"flex-start"} spacing={0}>
        {isOpenNavigation && <SensitiveNavigation />}
        {props.children}
      </HStack>
      <Divider />
      <HomeFooter />
    </>
  )
}

export default SensitiveLayout
