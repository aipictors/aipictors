"use client"
import { Divider, HStack } from "@chakra-ui/react"
// useState をインポート
import { HomeHeader } from "app/(main)/components/HomeHeader"
import { FooterHome } from "app/components/FooterHome"
import { useNavigation } from "app/hooks/useNavigation"
import { SensitiveNavigation } from "app/sensitive/components/SensitiveNavigation"

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
      <FooterHome />
    </>
  )
}

export default SensitiveLayout
