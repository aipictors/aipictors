"use client"
import { Divider, HStack } from "@chakra-ui/react"
// useState をインポート
import { HomeHeader } from "app/(main)/components/HomeHeader"
import { HomeNavigation } from "app/(main)/components/HomeNavigation"
import { FooterHome } from "app/components/FooterHome"
import { useNavigation } from "app/hooks/useNavigation"

type Props = {
  children: React.ReactNode
}

const MainLayout: React.FC<Props> = (props) => {
  const [isOpenNavigation, openNavigation] = useNavigation()

  return (
    <>
      <HomeHeader onOpenNavigation={openNavigation} />
      <HStack alignItems={"flex-start"} spacing={0}>
        {isOpenNavigation && <HomeNavigation />}
        {props.children}
      </HStack>
      <Divider />
      <FooterHome />
    </>
  )
}

export default MainLayout
