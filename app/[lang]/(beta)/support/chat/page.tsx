import { SupportChat } from "@/app/[lang]/(beta)/support/chat/_components/support-chat"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import type { Metadata } from "next"

const MessagePage = async () => {
  return (
    <MainCenterPage>
      <SupportChat />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MessagePage
