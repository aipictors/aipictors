import type { Metadata } from "next"
import { SupportChat } from "app/[lang]/(beta)/support/chat/components/SupportChat"
import { MainCenterPage } from "app/components/MainCenterPage"

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
